import { FastifyRequest, FastifyReply } from "../types/fastify";
import { capitalize } from "../utils";

const reportComment = async (
  req: FastifyRequest<{
    Body: {
      commentId: string;
      problem: ReportProblem;
      description: string;
    };
  }>,
  res: FastifyReply,
) => {
  // Check if user is authorize
  if (!req.userId)
    return res.code(401).send({
      status: "fail",
      message: "User is unauthorize",
    });

  // Check if comment exist
  const comment = await req.prisma.comment.findUnique({
    where: { id: req.body.commentId },
  });
  if (!comment)
    return res.code(404).send({
      status: "fail",
      message: "Comment not found",
    });

  // check if user is the owner of the comment
  if (comment.author_id === req.userId) {
    return res.code(403).send({
      status: "fail",
      message: "User is not authorize to report the comment",
    });
  }

  // check if user already reported the comment
  const reportExist = await req.prisma.report.findFirst({
    where: {
      reportedBy_id: req.userId,
      comment_id: req.body.commentId,
    },
  });

  if (reportExist)
    return res.code(403).send({
      status: "fail",
      error: "UserAlreadyReported",
      message: "User already reported the comment",
    });

  // Create report
  await req.prisma.report.create({
    data: {
      comment_id: req.body.commentId,
      problem: req.body.problem,
      type: "COMMENT",
      description: req.body.description,
      reportedBy_id: req.userId,
    },
  });

  // increment users PostReported count
  await req.prisma.user.update({
    where: { id: comment.author_id },
    data: {
      totalCommentsRerported: {
        increment: 1,
      },
    },
  });

  return res.code(200).send({ status: "success", message: "Comment Reported" });
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
      message: "User is restricted to report his/her own post",
    });

  // Check if post exist
  const postExist = await req.prisma.post.findUnique({
    where: {
      id: req.body.postId,
    },
  });
  if (!postExist)
    return res.code(404).send({ status: "fail", message: "Post not found" });

  // Check if user already report the post
  const reportExist = await req.prisma.report.findFirst({
    where: {
      post_id: req.body.postId,
      reportedBy_id: req.userId,
    },
  });
  if (reportExist)
    return res.code(403).send({
      status: "fail",
      error: "UserAlreadyReported",
      message: "User already reported this post",
    });

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

  // increment users PostReported count
  await req.prisma.user.update({
    where: { id: postExist.author_id },
    data: {
      totalPostsReported: {
        increment: 1,
      },
    },
  });

  return res.code(201).send({ status: "success", message: "Post reported" });
};

const getUsersTotalPostReport = async (
  req: FastifyRequest<{ Body: any; Params: { userId: string } }>,
  res: FastifyReply,
) => {
  // check if user is authorize
  if (!req.userId)
    return res.code(401).send({
      status: "fail",
      message: "User is not authorize",
    });

  // Total number of post reported
  const totalPostReported = await req.prisma.report.count({
    where: {
      type: "POST",
      Post: {
        author_id: req.params.userId,
      },
    },
  });

  return res.code(200).send({
    status: "success",
    data: {
      totalPostReported,
    },
  });
};

const getUsersTotalCommnentReport = async (
  req: FastifyRequest<{ Body: any; Params: { userId: string } }>,
  res: FastifyReply,
) => {
  // check if user is authorize
  if (!req.userId)
    return res.code(401).send({
      status: "fail",
      message: "User is not authorize",
    });

  // Total number of post reported
  const totalCommentReported = await req.prisma.report.count({
    where: {
      type: "COMMENT",
      Comment: {
        author_id: req.params.userId,
      },
    },
  });

  return res.code(200).send({
    status: "success",
    data: {
      totalCommentReported,
    },
  });
};

const updateCommentReportStatus = async (
  req: FastifyRequest<{ Body: { reportId: string; status: ReportStatus } }>,
  res: FastifyReply,
) => {
  // Check if report exist
  const reportExist = await req.prisma.report.findUnique({
    where: { id: req.body.reportId },
  });
  if (!reportExist)
    return res.code(404).send({ status: "fail", message: "Report not found" });

  // Update report status
  await req.prisma.report.update({
    where: { id: req.body.reportId },
    data: {
      status: req.body.status,
    },
  });

  return res.code(200).send({ status: "success", message: "Report updated" });
};

const updatePostReportStatus = async (
  req: FastifyRequest<{ Body: { reportId: string; status: ReportStatus } }>,
  reply: FastifyReply,
) => {
  // Check if report exist
  const reportExist = await req.prisma.report.findUnique({
    where: { id: req.body.reportId },
  });
  if (!reportExist)
    return reply
      .code(404)
      .send({ status: "fail", message: "Report not found" });

  // Update report status
  await req.prisma.report.update({
    where: { id: req.body.reportId },
    data: {
      status: req.body.status,
    },
  });

  return reply.code(200).send({ status: "success", message: "Report updated" });
};

const getPostReports = async (req: FastifyRequest, res: FastifyReply) => {
  const reports = await req.prisma.report.findMany({
    where: { type: "POST" },
    select: {
      id: true,
      problem: true,
      description: true,
      status: true,
      createdAt: true,

      Post: {
        select: {
          id: true,
          status: true,
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      },
      ReportedBy: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
        },
      },
    },
  });

  const parsedReports = reports.map((report) => {
    return {
      reportId: report.id,
      postId: report.Post!.id,
      reportedById: report.ReportedBy.id,
      reportedByFullname: `${capitalize(report.ReportedBy.firstname)} ${capitalize(report.ReportedBy.lastname!)}`,
      postAuthorId: report.Post?.author.id,
      postAurhorFullname: `${capitalize(report.Post?.author.firstname!)} ${capitalize(report.Post?.author.lastname!)}`,
      type: "POST",
      problem: report.problem,
      description: report.description,
      reportStatus: report.status,
      postStatus: report.Post?.status,
      createdAt: report.createdAt,
    };
  });

  return res.code(200).send({ status: "success", data: parsedReports });
};
const getCommentReports = async (req: FastifyRequest, res: FastifyReply) => {
  const reports = await req.prisma.report.findMany({
    where: { type: "COMMENT" },
    select: {
      id: true,
      problem: true,
      description: true,
      status: true,
      createdAt: true,
      ReportedBy: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
        },
      },
      Comment: {
        
        select: {
          id: true,
          status: true,
          post_id: true,
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      },
    },
  });

  const parsedCommentRpots = reports.map((report) => {
    return {
      reportId: report.id,
      postId: report.Comment!.post_id,  
      reportedById: report.ReportedBy.id,
      commentId: report.Comment!.id,
      reportedByFullname: `${capitalize(report.ReportedBy.firstname)} ${capitalize(report.ReportedBy.lastname)}`,
      commentAuthorId: report.Comment?.author.id,
      commentAuthorFullname: `${capitalize(report.Comment?.author.firstname!)} ${capitalize(report.Comment?.author.lastname!)}`,
      type: "COMMENT",
      problem: report.problem,
      description: report.description,
      reportStatus: report.status,
      commentStatus: report.Comment?.status,
      createdAt: report.createdAt,

    };
  });

  return res.code(200).send({ status: "success", data: parsedCommentRpots });
};

const deleteReport = async (
  req: FastifyRequest<{ Params: { reportId: string } }>,
  res: FastifyReply,
) => {
  // Check if report exist
  const reportExist = await req.prisma.report.findUnique({
    where: { id: req.params.reportId },
  });
  if (!reportExist)
    return res.code(404).send({ status: "fail", message: "Report not found" });

  // Delete report
  await req.prisma.report.delete({
    where: { id: req.params.reportId },
  });

  return res.code(200).send({ status: "success", message: "Report deleted" });
};

const reportConroller = {
  reportComment,
  reportPost,
  getUsersTotalPostReport,
  getUsersTotalCommnentReport,
  updateCommentReportStatus,
  updatePostReportStatus,
  getPostReports,
  getCommentReports,
  deleteReport,
};

export default reportConroller;

type ReportStatus = "RESOLVED" | "IN_REVIEW" | "UNRESOLVED";
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

type PostReportPostBody = {
  postId: string;
  description: string;
  problem: ReportProblem;
};
