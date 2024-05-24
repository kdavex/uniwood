import { Comment } from "@prisma/client";
import type { FastifyRequest, FastifyReply } from "../types/fastify.d";
import {
  commentExist,
  upVoteToggle as upVoteToggleQuery,
  downVoteToggle as downVoteToggleQuery,
  replyComment as replyCommentFc,
  testCommentQuery,
} from "../models/commentsQuery.js";
import { ObjectId } from "mongodb";
import { asterizeProfanicWords } from "../utils/wordTool.js";

const createComment = async (
  req: FastifyRequest<{ Body: { comment: string; postId: string } }>,
  res: FastifyReply,
) => {
  if (!req.body?.comment)
    return res.code(400).send({
      status: "fail",
      message: "Missing field",
      error: [{ field: "comment", message: "field required" }],
    });

  if (!req.body.postId)
    return res
      .send(400)
      .send({ status: "fail", message: "Post id is missing" });

  if (!req.userId)
    return res.code(401).send({
      status: "fail",
      message: "User is unauthorize",
    });

  const commentId = new ObjectId().toHexString();

  const commentSuccess = await req.prisma.post.update({
    where: { id: req.body.postId },
    data: {
      comments: {
        create: {
          id: commentId,
          content: req.body.comment,
          author_id: req.userId,
          type: "POST",
        },
      },
    },
    select: {
      comments: {
        where: {
          author_id: req.userId,
          content: req.body.comment,
          id: commentId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const postDoc = await req.prisma.post.findUnique({
    where: { id: req.body.postId },
    select: { author_id: true },
  });

  if (!postDoc)
    return res
      .code(404)
      .send({ status: "fail", message: "Post author not found" });

  // Create Notificatoin
  await req.prisma.notification.create({
    data: {
      type: "POST_COMMENT",
      Comment: {
        connect: { id: commentSuccess.comments[0].id },
      },
      NotifFrom: {
        connect: { id: req.userId },
      },
      NotifTo: {
        connect: { id: postDoc.author_id },
      },
      Post: {
        connect: { id: req.body.postId },
      },
    },
  });

  if (!commentSuccess)
    return res.code(500).send({ status: "fail", message: "Internal Error" });

  return res.code(200).send({ status: "success", message: "User added" });

  // Comment on a post
};

const updateComment = async (
  req: FastifyRequest<{ Body: { commentId: string; comment: string } }>,
  res: FastifyReply,
) => {
  if (!req.body?.comment)
    return res.code(400).send({
      status: "fail",
      message: "Missing field",
      error: [{ field: "comment", message: "field required" }],
    });

  if (!req.body.commentId)
    return res
      .code(404)
      .send({ status: "fail", message: "commentId id is missing" });

  if (!req.userId)
    return res.code(401).send({
      status: "fail",
      message: "User is unauthorize",
    });

  // Check if the user is teh author of the comment
  const comment = await req.prisma.comment.findUnique({
    where: { id: req.body.commentId },
  });

  if (!comment)
    return res.code(404).send({ status: "fail", message: "Comment not found" });

  if (comment.author_id !== req.userId && req?.role === "USER")
    return res.code(403).send({
      status: "fail",
      message:
        "User is not authorize to edit the comment. User is not the author of the comment",
    });

  const updateStatus = await req.prisma.comment.update({
    where: { id: req.body.commentId },
    data: { content: req.body.comment },
  });

  if (!updateStatus)
    return res.code(500).send({ status: "fail", message: "Internal Error" });

  return res.code(200).send({ status: "success", message: "Comment updated" });
};

const deleteComment = async (
  req: FastifyRequest<{ Params: { commentId: string } }>,
  res: FastifyReply,
) => {
  // Check if the user is the author of the comment
  const comment = await req.prisma.comment.findUnique({
    where: { id: req.params.commentId },
  });

  if (!comment)
    return res.code(404).send({ status: "fail", message: "Comment not found" });

  if (comment.author_id !== req.userId && req?.role === "USER")
    return res.code(403).send({
      status: "fail",
      message:
        "User is not authorize to delete the comment. User is not the author of the comment",
    });

  const deleteStatus = await req.prisma.comment.update({
    where: { id: req.params.commentId },
    data: { status: "ARCHIVED" },
  });

  if (!deleteStatus)
    return res.code(500).send({ status: "fail", message: "Internal Error" });

  return res.code(200).send({ status: "success", message: "Comment deleted" });
};

/**
 * Get All Comments or Comments of a post
 * @param req
 * @param reply
 */
const getComments = async (
  req: FastifyRequest<{ Querystring: { postId: string }; Body: any }>,
  reply: FastifyReply,
) => {
  // Filter Params
  let comments: Comment[] = [];

  if (req.query.postId)
    comments = await req.prisma.comment.findMany({
      where: { post_id: req.query.postId },
    });
  else
    comments = await req.prisma.comment.findMany({
      where: {
        replies: {
          some: {},
        },
      },
      include: { replies: true },
    });

  comments = comments.map((comment) => {
    return {
      ...comment,
      content: asterizeProfanicWords(comment.content),
    };
  });

  return reply.code(200).send({ status: "success", comments });
};

const getComment = async (
  req: FastifyRequest<{ Params: { commentId: string }; Body: any }>,
  reply: FastifyReply,
) => {
  let comment = await req.prisma.comment.findUnique({
    where: { id: req.params.commentId },
  });

  if (!comment)
    return reply
      .code(404)
      .send({ status: "fail", message: "Comment not found" });

  comment = { ...comment, content: asterizeProfanicWords(comment.content) };

  return reply.code(200).send({ status: "success", comment });
};

const upVoteToggle = async (
  req: FastifyRequest<{ Body: { commentId: string } }>,
  reply: FastifyReply,
) => {
  if (!req.body.commentId)
    return reply.code(400).send({
      status: "fail",
      error: "Missing Field",
      message: [{ field: "commentId", message: "field required" }],
    });

  if (!req.userId)
    return reply
      .code(401)
      .send({ status: "fail", message: "User is unauthorize" });

  const isCommentExist = await commentExist(
    { commentId: req.body.commentId },
    req.prisma,
  );
  if (!isCommentExist)
    return reply
      .code(404)
      .send({ status: "fail", message: "Comment not found" });

  await upVoteToggleQuery(
    { commentId: req.body.commentId, userId: req.userId },
    req.prisma,
  );

  return reply.code(200).send({ status: "success" });
};

const downVoteToggle = async (
  req: FastifyRequest<{ Body: { commentId: string } }>,
  reply: FastifyReply,
) => {
  if (!req.body?.commentId)
    return reply
      .code(400)
      .send({ status: "fail", message: "Comment id is missing" });

  if (!req.userId)
    return reply
      .code(401)
      .send({ status: "fail", message: "User is unauthorize" });

  const isCommentExist = await commentExist(
    { commentId: req.body.commentId },
    req.prisma,
  );
  if (!isCommentExist)
    return reply
      .code(404)
      .send({ status: "fail", message: "Comment not found" });

  await downVoteToggleQuery(
    { userId: req.userId, commentId: req.body.commentId },
    req.prisma,
  );

  return reply.code(200).send({ status: "success" });
};

const replyComment = async (
  req: FastifyRequest<{
    Body: {
      content: string;
      targetId: string;
      commentId: string;
      type?: "post" | "project";
    };
  }>,
  res: FastifyReply,
) => {
  if (
    req.body.type === null ||
    req.body.type === undefined ||
    !req.body.type.match(/^(project|post)$/i)
  ) {
    return res.code(400).send({
      status: "fail",
      message: "Missing field",
      error: [{ field: "type", message: "field required" }],
    });
  }

  if (!req.userId) {
    return res.code(401).send({
      status: "fail",
      message: "User is unauthorize",
    });
  }
  await replyCommentFc(
    {
      commentId: req.body.commentId,
      targetId: req.body.targetId,
      author_id: req.userId,
      content: req.body.content,
      type: req.body.type.toUpperCase() as "POST" | "PROJECT",
    },
    req.prisma,
  );

  return res.code(200).send({ status: "success", message: "Comment Replied" });
};

const unArchiveComment = async (
  req: FastifyRequest<{ Params: { commentId: string } }>,
  res: FastifyReply,
) => {
  // Check if comment exist
  const commentExist = req.prisma.comment.findUnique({
    where: { id: req.params.commentId },
  });

  if (!commentExist)
    return res.code(404).send({ status: "fail", message: "Comment not found" });

  // Unarchive the comment
  const unarchiveComment = req.prisma.comment.update({
    where: { id: req.params.commentId },
    data: { status: "ACTIVE" },
  });

  return res.code(200).send({
    status: "success",
    message: "Comment unarchived",
    data: unarchiveComment,
  });
};

const commentController = {
  createComment,
  updateComment,
  getComment,
  getComments,
  deleteComment,
  upVoteToggle,
  downVoteToggle,
  replyComment,
  unArchiveComment,
};

export default commentController;
