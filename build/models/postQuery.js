"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePostTogggle = exports.createPost = void 0;
const createPost = async ({ title, context, tags, media, userId }, prisma) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            posts: {
                create: {
                    title: title ?? null,
                    context,
                    tags: tags ?? [],
                    media: media ?? [],
                },
            },
        },
    });
};
exports.createPost = createPost;
const likePostTogggle = async ({ postId, userId }, prisma) => {
    const [user, post] = await prisma.$transaction([
        prisma.user.findUnique({
            where: { id: userId },
            select: { liked_posts_id: true },
        }),
        prisma.post.findUnique({
            where: { id: postId },
            select: { liked_by_users_id: true, author_id: true },
        }),
    ]);
    if (post === null || user === null)
        throw new Error("User or post not found");
    if (post.liked_by_users_id.includes(userId)) {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    liked_posts_id: {
                        set: user.liked_posts_id.filter((e) => e !== postId),
                    },
                },
            }),
            prisma.post.update({
                where: { id: postId },
                data: {
                    liked_by_users_id: {
                        set: post.liked_by_users_id.filter((e) => e !== userId),
                    },
                },
            }),
        ]);
    }
    else {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { liked_posts_id: { push: postId } },
            }),
            prisma.post.update({
                where: { id: postId },
                data: { liked_by_users_id: { push: userId } },
            }),
        ]);
        // Add notification
        const notificationExist = await prisma.notification.findFirst({
            where: {
                type: "POST_REACT",
                notifFrom_id: userId,
                post_id: postId,
            },
            select: {
                id: true,
            },
        });
        console.log({
            notificationExist,
            userId,
            author_id: post.author_id,
            postId,
        });
        if (!notificationExist && post.author_id !== userId) {
            await prisma.notification.create({
                data: {
                    type: "POST_REACT",
                    NotifTo: { connect: { id: post.author_id } },
                    Post: {
                        connect: { id: postId },
                    },
                    NotifFrom: {
                        connect: { id: userId },
                    },
                },
            });
        }
    }
};
exports.likePostTogggle = likePostTogggle;
