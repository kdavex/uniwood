"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyComment = exports.createComment = exports.getCommment = exports.upVoteToggle = exports.downVoteToggle = exports.testCommentQuery = exports.commentExist = void 0;
const mongodb_1 = require("mongodb");
async function commentExist({ commentId, }, prisma) {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment)
        return false;
    return true;
}
exports.commentExist = commentExist;
// export async function upVoteTogglex(
//   {
//     commentId,
//     userId,
//   }: {
//     commentId: string;
//     userId: string;
//   },
//   prisma: PrismaClient
// ) {
//   const likeExist = await prisma.comment.findUnique({
//     where: {
//       id: commentId,
//       OR: [
//         { up_voted_by_users_id: { has: userId } },
//         { down_voted_by_users_id: { has: userId } },
//       ],
//     },
//     select: { up_voted_by_users_id: true, down_voted_by_users_id: true },
//   });
//   console.log("upvotes: " + likeExist?.up_voted_by_users_id);
//   // Reomve downVote if exist
//   if (!likeExist?.up_voted_by_users_id.length) {
//     console.log("Upvote Toggle: vote does not exist");
//     await prisma.comment.update({
//       where: { id: commentId },
//       data: {
//         up_voted_by_users_id: { push: userId },
//         down_voted_by_users_id: {
//           set:
//             likeExist?.down_voted_by_users_id.filter((e) => userId !== e) || [],
//         },
//       },
//     });
//   } else {
//     await prisma.comment.update({
//       where: { id: commentId },
//       data: {
//         up_voted_by_users_id: {
//           set:
//             likeExist?.up_voted_by_users_id.filter((e) => userId !== e) || [],
//         },
//         down_voted_by_users_id: {
//           set:
//             likeExist?.down_voted_by_users_id.filter((e) => userId !== e) || [],
//         },
//       },
//     });
//   }
// }
async function testCommentQuery({ userId, commentId }, prisma) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            comments: {
                connect: { id: commentId },
            },
        },
    });
}
exports.testCommentQuery = testCommentQuery;
// export async function downVoteTogglex(
//   { userId, commentId }: { userId: string; commentId: string },
//   prisma: PrismaClient
// ) {
//   const likeExist = await prisma.comment.findUnique({
//     where: {
//       id: commentId,
//       OR: [
//         { down_voted_by_users_id: { has: userId } },
//         { up_voted_by_users_id: { has: userId } },
//       ],
//     },
//     select: { down_voted_by_users_id: true, up_voted_by_users_id: true },
//   });
//   if (likeExist?.down_voted_by_users_id.length)
//     await prisma.comment.update({
//       where: { id: commentId },
//       data: {
//         down_voted_by_users_id: {
//           set:
//             likeExist?.down_voted_by_users_id.filter((e) => e !== userId) || [],
//         },
//         up_voted_by_users_id: {
//           set:
//             likeExist?.up_voted_by_users_id.filter((e) => userId !== e) || [],
//         },
//       },
//     });
//   else
//     await prisma.comment.update({
//       where: { id: commentId },
//       data: {
//         down_voted_by_users_id: { push: userId },
//         up_voted_by_users_id: {
//           set:
//             likeExist?.up_voted_by_users_id.filter((e) => e !== userId) || [],
//         },
//       },
//     });
// }
async function downVoteToggle({ userId, commentId }, prisma) {
    const [commentReactions, userCommentReactions] = await prisma.$transaction([
        prisma.comment.findUnique({
            where: { id: commentId },
            select: { down_voted_by_users_id: true, up_voted_by_users_id: true },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { up_voted_comments_id: true, down_voted_comments_id: true },
        }),
    ]);
    if (commentReactions?.down_voted_by_users_id.includes(userId)) {
        const updateComment = prisma.comment.update({
            where: { id: commentId },
            data: {
                down_voted_by_users_id: {
                    set: commentReactions.down_voted_by_users_id.filter((e) => e !== userId),
                },
                up_voted_by_users_id: {
                    set: commentReactions.up_voted_by_users_id.filter((e) => e !== userId),
                },
            },
        });
        const updateUser = prisma.user.update({
            where: { id: userId },
            data: {
                up_voted_comments_id: {
                    set: userCommentReactions?.up_voted_comments_id.filter((e) => e !== commentId),
                },
                down_voted_comments_id: {
                    set: userCommentReactions?.down_voted_comments_id.filter((e) => e !== commentId),
                },
            },
        });
        await prisma.$transaction([updateComment, updateUser]);
    }
    else {
        const updateComment = prisma.comment.update({
            where: { id: commentId },
            data: {
                down_voted_by_users_id: { push: userId },
                up_voted_by_users_id: {
                    set: commentReactions?.up_voted_by_users_id.filter((e) => e !== userId),
                },
            },
        });
        const updateUser = prisma.user.update({
            where: { id: userId },
            data: {
                down_voted_comments_id: { push: commentId },
                up_voted_comments_id: {
                    set: userCommentReactions?.down_voted_comments_id.filter((e) => e !== commentId),
                },
            },
        });
        await prisma.$transaction([updateComment, updateUser]);
    }
}
exports.downVoteToggle = downVoteToggle;
async function upVoteToggle({ userId, commentId }, prisma) {
    const [commentReactions, userCommentReactions] = await prisma.$transaction([
        prisma.comment.findUnique({
            where: { id: commentId },
            select: { down_voted_by_users_id: true, up_voted_by_users_id: true },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { up_voted_comments_id: true, down_voted_comments_id: true },
        }),
    ]);
    if (commentReactions?.up_voted_by_users_id.includes(userId)) {
        const updateComment = prisma.comment.update({
            where: { id: commentId },
            data: {
                down_voted_by_users_id: {
                    set: commentReactions.down_voted_by_users_id.filter((e) => e !== userId),
                },
                up_voted_by_users_id: {
                    set: commentReactions.up_voted_by_users_id.filter((e) => e !== userId),
                },
            },
        });
        const updateUser = prisma.user.update({
            where: { id: userId },
            data: {
                up_voted_comments_id: {
                    set: userCommentReactions?.up_voted_comments_id.filter((e) => e !== commentId),
                },
                down_voted_comments_id: {
                    set: userCommentReactions?.up_voted_comments_id.filter((e) => e !== commentId),
                },
            },
        });
        await prisma.$transaction([updateComment, updateUser]);
    }
    else {
        const updateComment = prisma.comment.update({
            where: { id: commentId },
            data: {
                up_voted_by_users_id: { push: userId },
                down_voted_by_users_id: {
                    set: commentReactions?.up_voted_by_users_id.filter((e) => e !== userId),
                },
            },
        });
        const updateUser = prisma.user.update({
            where: { id: userId },
            data: {
                up_voted_comments_id: { push: commentId },
                down_voted_comments_id: {
                    set: commentReactions?.up_voted_by_users_id.filter((e) => e !== commentId),
                },
            },
        });
        await prisma.$transaction([updateComment, updateUser]);
    }
}
exports.upVoteToggle = upVoteToggle;
async function getCommment(commentId, prisma) {
    return await prisma.comment.findUnique({
        where: { id: commentId },
    });
}
exports.getCommment = getCommment;
async function createComment({ userId, postId, content, type, }, prisma) {
    await prisma.post.update({
        where: { id: postId },
        data: {
            comments: {
                create: {
                    content: content,
                    author_id: userId,
                    type: type,
                },
            },
        },
    });
}
exports.createComment = createComment;
async function replyComment({ commentId, targetId, author_id, content, type, }, prisma) {
    const replyId = new mongodb_1.ObjectId().toHexString();
    if (type === "POST")
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                replies_id: {
                    push: replyId,
                },
                replies: {
                    create: {
                        id: replyId,
                        content: content,
                        author_id: author_id,
                        type: type,
                        post_id: targetId,
                    },
                },
            },
        });
    else if (type === "PROJECT")
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                replies_id: {
                    push: replyId,
                },
                replies: {
                    create: {
                        id: replyId,
                        content: content,
                        author_id: author_id,
                        type: type,
                        project_id: targetId,
                    },
                },
            },
        });
}
exports.replyComment = replyComment;
