import { PostMedia } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "../types/fastify.d";
import { createPost as createPostQuery } from "../models/postQuery";
import { moveFile } from "../utils/fileManager";
import { likePostTogggle as likePostToggleFnc } from "../models/postQuery";
import { isValidObjectId } from "../utils/checker";
import { capitalize } from "../utils/index";
import { recommendPosts } from "../utils/recomAlgo";
import { asterizeProfanicWords } from "../utils/wordTool";

const createPost = async (
  req: FastifyRequest<{ Body: PostPostBody }>,
  res: FastifyReply,
) => {
  const userId = req.userId; // Edit from "string" to "req.user.id

  // TODO add validation
  if (!userId)
    return res.code(401).send({
      status: "fail",
      message: "User is unauthorize. Access token not read",
    });

  // Create Post
  try {
    await createPostQuery({ ...req.body, userId }, req.prisma);
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: "fail", message: "Internal Error" });
  }

  // Move tmp file to the public folder
  req.body.media.forEach(
    async (elem) => await moveFile([elem.filename], "tmp", "public"),
  );
  return res.code(201).send({ status: "success", message: "Post created" });
};

const updatePost = async (
  req: FastifyRequest<{ Body: PostPutBody }>,
  res: FastifyReply,
) => {
  let savedMedia: { filename: string; caption: string }[] = [];

  if (req.body.savedMedia) savedMedia = JSON.parse(req.body.savedMedia) ?? [];

  if (!req.userId)
    return res
      .code(401)
      .send({ status: "fail", message: "User is not authorize" });

  //Check if post exist
  const postExist = await req.prisma.post.findUnique({
    where: { id: req.body.postId },
  });
  if (postExist === null)
    return res.code(404).send({ status: "fail", message: "Post not found" });

  // Check if post is belong to user or the admin
  if (postExist.author_id !== req.userId && req?.role !== "ADMIN")
    return res
      .code(403)
      .send({ status: "fail", message: "User is not authorize" });

  // Process Data
  let fileterSavedMedia = postExist.media.filter((media) =>
    savedMedia.find((saved) => saved.filename === media.filename),
  );
  if (req.body.media)
    fileterSavedMedia = [...fileterSavedMedia, ...req.body.media];
  const postData = {
    tags: req.body.tags ?? postExist.tags,
    context: req.body.context ?? postExist.context,
    title: req.body.title ?? postExist.title,
    media: fileterSavedMedia,
  };

  // Update post
  try {
    const updateData = await req.prisma.post.update({
      where: { id: req.body.postId },
      data: postData,
    });
    console.log(updateData);
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: "fail", message: "Internal Error" });
  }

  // Move tmp file to the public folder
  if (req.body.media)
    req.body.media.forEach(
      async (elem) => await moveFile([elem.filename], "tmp", "public"),
    );
  return res.code(200).send({
    status: "success",
    message: "Post updated",
    data: { updatedMedia: fileterSavedMedia },
  });
};

const getPosts = async (req: FastifyRequest, res: FastifyReply) => {
  // TODO add validaton
  if (!req.userId)
    return res
      .code(401)
      .send({ status: "fail", message: "User is unauthorize" });

  // GET posts
  let posts: any | undefined;
  try {
    posts = await req.prisma.post.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        context: true,
        title: true,
        tags: true,
        media: true,
        createdAt: true,
        author: {
          select: {
            firstname: true,
            lastname: true,
            proffeciency: true,
            affiliation: true,
            user_image: {
              select: {
                pfp_name: true,
                cover_name: true,
              },
            },
          },
        },
        comments: {
          select: {
            content: true,
            createdAt: true,
            up_voted_by_users_id: true,
            author: {
              select: {
                firstname: true,
                lastname: true,
                proffeciency: true,
                affiliation: true,
                user_image: {
                  select: {
                    pfp_name: true,
                    cover_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log(posts);
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: "fail", message: "Internal Error" });
  }

  posts = posts.map((post) => {
    return {
      ...post,
      title: asterizeProfanicWords(post.title ?? ""),
      context: asterizeProfanicWords(post.context ?? ""),
      comments: post.comments.map((comment) => {
        return {
          ...comment,
          content: asterizeProfanicWords(comment.content),
        };
      }),
    };
  });
  return res.code(200).send({ status: "success", data: posts });
};

const getAllUserPost = async (
  req: FastifyRequest<{
    Params: { usernameOrId: string };
    Body: any;
  }>,
  res: FastifyReply,
) => {
  let posts = await req.prisma.post.findMany({
    where: {
      author: {
        username: req.params.usernameOrId,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      context: true,
      media: true,
      createdAt: true,
      title: true,
      tags: true,
      liked_by_users_id: true,

      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          up_voted_by_users_id: true,
          down_voted_by_users_id: true,
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              bio: true,
              affiliation: true,
              user_image: true,
              address: true,
              username: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          bio: true,
          affiliation: true,
          user_image: true,
          address: true,
          username: true,
          follower_ids: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (isValidObjectId(req.params.usernameOrId) && posts.length === 0) {
    posts = await req.prisma.post.findMany({
      where: {
        author: {
          id: req.params.usernameOrId,
        },
      },
      select: {
        id: true,
        context: true,
        media: true,
        createdAt: true,
        title: true,
        tags: true,
        liked_by_users_id: true,
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            up_voted_by_users_id: true,
            down_voted_by_users_id: true,
            author: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                bio: true,
                affiliation: true,
                user_image: true,
                username: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            bio: true,
            affiliation: true,
            user_image: true,
            address: true,
            username: true,
            follower_ids: true,
          },
        },
      },
    });
  }

  if (!posts) {
    return res
      .code(404)
      .send({ status: "fail", message: "User not found by username" });
  }

  let data = posts.map((post) => {
    return {
      id: post.id,
      title: asterizeProfanicWords(post.title ?? ""),
      context: asterizeProfanicWords(post.context),
      media: post.media,
      liked_by_users_id: post.liked_by_users_id,
      createdAt: post.createdAt,
      tags: post.tags,
      comments: post.comments.map((comment) => {
        return {
          id: comment.id, // Fix: Access the 'id' property from the 'comment' object
          content: asterizeProfanicWords(comment.content),
          createdAt: comment.createdAt,
          up_voted_by_users_id: comment.up_voted_by_users_id,
          down_voted_by_users_id: comment.down_voted_by_users_id,
          author: {
            id: comment.author.id,
            fullname: capitalize(
              `${comment.author.firstname} ${comment.author.lastname}`,
            ),
            bio: comment.author.bio,
            affiliation: comment.author.affiliation,
            cover: comment.author.user_image.cover_name,
            pfp: comment.author.user_image.pfp_name,
            address: comment.author.address,
            username: comment.author.username,
          },
        };
      }),
      author: {
        id: post.author.id,
        fullname: capitalize(
          `${post.author.firstname} ${post.author.lastname}`,
        ),
        bio: post.author.bio,
        affiliation: post.author.affiliation,
        cover: post.author.user_image.cover_name,
        pfp: post.author.user_image.pfp_name,
        address: capitalize(
          `${post.author.address.barangay}, ${post.author.address.municipality}, ${post.author.address.province}`,
        ),
        username: post.author.username,
      },
    };
  });

  return res.code(200).send({
    status: "success",
    data: data,
  });
};

const deletePost = async (
  req: FastifyRequest<{ Params: { postId: string | undefined }; Body: any }>,
  res: FastifyReply,
) => {
  // TODO add validation
  if (req.params.postId === undefined)
    return res
      .code(400)
      .send({ status: "fail", message: "Post id is required" });
  if (req.userId === undefined)
    return res
      .code(401)
      .send({ status: "fail", message: "User is unauthorize" });

  // Check if post exist
  const postExist = await req.prisma.post.findUnique({
    where: {
      id: req.params.postId,
    },
  });
  if (!postExist)
    return res.code(404).send({ status: "fail", message: "Post is not exist" });

  // Check if post is belong to user
  if (postExist.author_id !== req.userId && req.role !== "ADMIN")
    return res
      .code(403)
      .send({ status: "fail", message: "User is not authorize" });

  // delete post
  const deleteStatus = await req.prisma.post.update({
    where: {
      id: req.params.postId,
    },
    data: {
      status: "ARCHIVED",
    },
  });

  if (!deleteStatus)
    return res.code(500).send({ status: "fail", message: "Internal Error" });

  return res.code(200).send({ status: "success", message: "Post deleted" });
};

const getAllPosts = async (req: FastifyRequest, res: FastifyReply) => {
  const posts = await req.prisma.post.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      context: true,
      media: true,
      createdAt: true,
      title: true,
      tags: true,
      liked_by_users_id: true,
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          up_voted_by_users_id: true,
          down_voted_by_users_id: true,
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              bio: true,
              affiliation: true,
              user_image: true,
              address: true,
              username: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          bio: true,
          affiliation: true,
          user_image: true,
          address: true,
          username: true,
        },
      },
    },
  });

  let data = posts.map((post) => {
    return {
      id: post.id,
      title: asterizeProfanicWords(post.title),
      context: asterizeProfanicWords(post.context),
      media: post.media,
      liked_by_users_id: post.liked_by_users_id,
      createdAt: post.createdAt,
      tags: post.tags,
      comments: post.comments.map((comment) => {
        return {
          id: comment.id, // Fix: Access the 'id' property from the 'comment' object
          content: asterizeProfanicWords(comment.content),
          createdAt: comment.createdAt,
          up_voted_by_users_id: comment.up_voted_by_users_id,
          down_voted_by_users_id: comment.down_voted_by_users_id,
          author: {
            id: comment.author.id,
            fullname: capitalize(
              `${comment.author.firstname} ${comment.author.lastname}`,
            ),
            bio: comment.author.bio,
            affiliation: comment.author.affiliation,
            cover: comment.author.user_image.cover_name,
            pfp: comment.author.user_image.pfp_name,
            address: comment.author.address,
            username: comment.author.username,
          },
        };
      }),
      author: {
        id: post.author.id,
        fullname: capitalize(
          `${post.author.firstname} ${post.author.lastname}`,
        ),
        bio: post.author.bio,
        affiliation: post.author.affiliation,
        cover: post.author.user_image.cover_name,
        pfp: post.author.user_image.pfp_name,
        address: capitalize(
          `${post.author.address.barangay}, ${post.author.address.municipality}, ${post.author.address.province}`,
        ),
        username: post.author.username,
      },
    };
  });

  return res.code(200).send({ status: "success", data });
};

const getPost = async (
  req: FastifyRequest<{ Params: { postId: string }; Body: any }>,
  res: FastifyReply,
) => {
  if (!req.params.postId)
    return res
      .code(400)
      .send({ status: "fail", message: "Post id is required" });

  const postExist = await req.prisma.post.findUnique({
    where: {
      id: req.params.postId,
      status: "ACTIVE",
    },
    select: {
      author: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!postExist)
    return res.code(404).send({ status: "fail", message: "Post not found" });

  return res.code(200).send({ status: "success", data: postExist });
};

const likePostToggle = async (
  req: FastifyRequest<{ Body: { postId?: string } }>,
  res: FastifyReply,
) => {
  if (!req.userId)
    return res
      .code(401)
      .send({ status: "fail", message: "User is not authorize" });

  if (!req.body?.postId)
    return res.code(400).send({
      status: "fail",
      message: "Missing body parameter",
      error: "Missing postId field",
    });
  await likePostToggleFnc(
    { postId: req.body.postId, userId: req.userId },
    req.prisma,
  );

  const postExist = await req.prisma.post.findUnique({
    where: {
      id: req.body.postId,
    },
    select: {
      author: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!postExist)
    return res.code(404).send({ status: "fail", message: "Post not found" });

  // Todo create notification

  // await req.prisma.user.update({
  //   where: {
  //     id: postExist.author.id,
  //   },
  //   data: {
  //     notification: {
  //       create: {
  //         type: "REACT",
  //         post_id: req.body.postId,
  //       },
  //     },
  //   },
  // });
  return res
    .code(200)
    .send({ status: "success", message: "Post like status toggled" });
};

const getTopTags = async (
  req: FastifyRequest<{ Querystring: { count: string } }>,
  res: FastifyReply,
) => {
  const count = parseInt(req.query.count) || 10;
  const tags = await req.prisma.post.findMany({
    select: {
      tags: true,
    },
  });

  const tagCount: { [key: string]: number } = {};
  tags.forEach((post) => {
    post.tags.forEach((tag) => {
      if (tagCount[tag]) tagCount[tag]++;
      else tagCount[tag] = 1;
    });
  });

  const sortedTags = Object.entries(tagCount).sort(
    (a, b) => tagCount[b[0]] - tagCount[a[0]],
  );

  console.log({ sortedTags, tagCount });
  return res.code(200).send({
    status: "success",
    data: Object.fromEntries(sortedTags.slice(0, count)),
  });
};

const getPostById = async (
  req: FastifyRequest<{ Params: { postId: string }; Body: any }>,
  res: FastifyReply,
) => {
  const postDoc = await req.prisma.post.findUnique({
    where: { id: req.params.postId },
    select: {
      id: true,
      title: true,
      context: true,
      createdAt: true,
      liked_by_users_id: true,
      media: true,
      tags: true,
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              firstname: true,
              lastname: true,
              user_image: true,
              affiliation: true,
              id: true,
              bio: true,
              address: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      author: {
        select: {
          firstname: true,
          lastname: true,
          user_image: true,
          affiliation: true,
          id: true,
          bio: true,
          address: true,
          username: true,
        },
      },
    },
  });

  if (!postDoc)
    return res.code(404).send({ status: "fail", error: "Post not found" });

  const parsedDoc = {
    id: postDoc.id,
    title: asterizeProfanicWords(postDoc.title),
    context: asterizeProfanicWords(postDoc.context),
    createdAt: postDoc.createdAt,
    liked_by_users_id: postDoc.liked_by_users_id,
    media: postDoc.media,
    tags: postDoc.tags,
    author: {
      id: postDoc.author.id,
      affilitaion: postDoc.author.affiliation,
      fullname: capitalize(
        `${postDoc.author.firstname} ${postDoc.author.lastname}`,
      ),
      username: postDoc.author.username,
      pfp: postDoc.author.user_image.pfp_name,
      cover: postDoc.author.user_image.cover_name,
      address: capitalize(
        `${postDoc.author.address.barangay}, ${postDoc.author.address.municipality}, ${postDoc.author.address.province}`,
      ),
    },
    comments: postDoc.comments.map((comment) => {
      return {
        ...comment,
        content: asterizeProfanicWords(comment.content),
        author: {
          id: comment.author.id,
          fullname: capitalize(
            `${comment.author.firstname} ${comment.author.lastname}`,
          ),
          username: comment.author.username,
          bio: comment.author.bio,
          pfp: comment.author.user_image.pfp_name,
          cover: comment.author.user_image.cover_name,
          address: capitalize(
            `${comment.author.address.barangay}, ${comment.author.address.municipality}, ${comment.author.address.province}`,
          ),
          affiliation: comment.author.affiliation,
        },
      };
    }),
  };

  return res.code(200).send({ status: "success", data: parsedDoc });
};

const getRecommendedPosts = async (
  req: FastifyRequest<{
    Body: any;
    Querystring: { fromFollowedUsersOnly: string | null };
  }>,
  res: FastifyReply,
) => {
  const allPosts = await req.prisma.post.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      context: true,
      media: true,
      createdAt: true,
      title: true,
      tags: true,
      liked_by_users_id: true,
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          up_voted_by_users_id: true,
          down_voted_by_users_id: true,
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              bio: true,
              affiliation: true,
              user_image: true,
              address: true,
              username: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          bio: true,
          affiliation: true,
          user_image: true,
          address: true,
          username: true,
          follower_ids: true,
        },
      },
    },
  });

  let postParsedData = allPosts.map((post) => {
    return {
      id: post.id,
      title: asterizeProfanicWords(post.title),
      context: asterizeProfanicWords(post.context),
      media: post.media,
      liked_by_users_id: post.liked_by_users_id,
      createdAt: post.createdAt,
      tags: post.tags,
      comments: post.comments.map((comment) => {
        return {
          id: comment.id, // Fix: Access the 'id' property from the 'comment' object
          content: asterizeProfanicWords(comment.content),
          createdAt: comment.createdAt,
          up_voted_by_users_id: comment.up_voted_by_users_id,
          down_voted_by_users_id: comment.down_voted_by_users_id,
          author: {
            id: comment.author.id,
            fullname: capitalize(
              `${comment.author.firstname} ${comment.author.lastname}`,
            ),
            bio: comment.author.bio,
            affiliation: comment.author.affiliation,
            cover: comment.author.user_image.cover_name,
            pfp: comment.author.user_image.pfp_name,
            address: comment.author.address,
            username: comment.author.username,
          },
        };
      }),
      author: {
        id: post.author.id,
        fullname: capitalize(
          `${post.author.firstname} ${post.author.lastname}`,
        ),
        bio: post.author.bio,
        affiliation: post.author.affiliation,
        cover: post.author.user_image.cover_name,
        pfp: post.author.user_image.pfp_name,
        address: capitalize(
          `${post.author.address.barangay}, ${post.author.address.municipality}, ${post.author.address.province}`,
        ),
        username: post.author.username,
        follower_ids: post.author.follower_ids,
      },
    };
  });

  if (req.query.fromFollowedUsersOnly)
    postParsedData = postParsedData.filter((post) => {
      console.log({
        authorFollwoer: post.author.follower_ids,
        userId: req.userId,
      });

      return post.author.follower_ids.includes(req.userId);
    });

  const user = await req.prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      interests: true,
      liked_posts_id: true,
    },
  });

  if (!user)
    return res.code(404).send({ status: "fail", message: "User not found" });

  const recomPost = await recommendPosts(user, postParsedData);

  return res.code(200).send({ status: "success", data: recomPost ?? [] });
};

const reportPost = async (
  req: FastifyRequest<{ Body: PostReportPostBody }>,
  res: FastifyReply,
) => {
  // Check if user is authorize
  if (!req.userId)
    return res
      .code(401)
      .send({ status: "fail", message: "User is not authorize" });

  // Check if user is report his/her own post
  const userOwned = await req.prisma.post.findUnique({
    where: {
      id: req.body.postId,
      author: {
        id: req.userId,
      },
    },
  });
  if (userOwned)
    return res.code(403).send({
      status: "fail",
      error: "UserPostOwnerRestriction",
      message: "User is not authorize",
    });

  // Check if post exist
  const postExist = await req.prisma.post.findUnique({
    where: {
      id: req.body.postId,
    },
  });
  if (!postExist)
    return res.code(404).send({ status: "fail", message: "Post not found" });

  // Create report
  try {
    await req.prisma.report.create({
      data: {
        description: req.body.description,
        type: "POST",
        problem: req.body.problem,
        post_id: req.body.postId,
        reportedBy_id: req.userId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: "fail", message: "Internal Error" });
  }
};

export type PostReportPostBody = {
  postId: string;
  description: string;
  problem: ReportProblem;
};

type ReportProblem =
  | "INAPPRIOPRIATE_CONTENT"
  | "FALSE_INFORMATION"
  | "HARASSMENT"
  | "VIOLENCE_OR_THREATS"
  | "COPYRIGHT_INFIRNGEMENT"
  | "PRIVACY_VIOLATION"
  | "SCAM"
  | "IMPERSONATION"
  | "HATESPEECH";

export type PostPostBody = {
  title?: string;
  context: string;
  tags: string[];
  media: PostMedia[];
};

export type PostPutBody = {
  title: string;
  postId: string;
  tags?: string[];
  context?: string;
  media?: {
    caption: string | null;
    filename: string;
  }[];
  savedMedia?: string;
};

const postController = {
  createPost,
  updatePost,
  getPosts,
  deletePost,
  getAllPosts,
  getPost,
  likePostToggle,
  getAllUserPost,
  getTopTags,
  getPostById,
  getRecommendedPosts,
};

export default postController;
