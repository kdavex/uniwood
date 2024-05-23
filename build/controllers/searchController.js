"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const index_1 = require("../utils/index");
const search = async (req, res) => {
    if (req.params.search === undefined)
        return res
            .status(400)
            .send({ status: "fail", message: "No search term provided" });
    const wholeSearchTerm = req.params.search;
    const searchTerms = wholeSearchTerm.split(" ");
    let posts = await req.prisma.post.findMany({
        where: {
            OR: [
                ...searchTerms.map((term) => {
                    return {
                        context: { contains: term, mode: "insensitive" },
                    };
                }),
                ...searchTerms.map((term) => {
                    return {
                        title: { contains: term, mode: "insensitive" },
                    };
                }),
                ...searchTerms.map((term) => {
                    return { tags: { has: term } };
                }),
                {
                    author: {
                        OR: [
                            ...searchTerms.map((term) => {
                                return {
                                    firstname: {
                                        contains: term,
                                        mode: "insensitive",
                                    },
                                };
                            }),
                            ...searchTerms.map((term) => {
                                return {
                                    lastname: {
                                        contains: term,
                                        mode: "insensitive",
                                    },
                                };
                            }),
                            ...searchTerms.map((term) => {
                                return {
                                    username: {
                                        contains: term,
                                        mode: "insensitive",
                                    },
                                };
                            }),
                        ],
                    },
                },
            ],
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
                },
            },
        },
    });
    let users = await req.prisma.user.findMany({
        where: {
            OR: [
                ...searchTerms.map((term) => {
                    return {
                        firstname: { contains: term, mode: "insensitive" },
                    };
                }),
                ...searchTerms.map((term) => {
                    return {
                        lastname: { contains: term, mode: "insensitive" },
                    };
                }),
                ...searchTerms.map((term) => {
                    return {
                        username: { contains: term, mode: "insensitive" },
                    };
                }),
            ],
        },
        select: {
            id: true,
            firstname: true,
            lastname: true,
            affiliation: true,
            user_image: true,
            username: true,
            bio: true,
            address: true,
        },
    });
    let projects = await req.prisma.project.findMany({
        where: {
            OR: [
                ...searchTerms.map((term) => {
                    return {
                        context: { contains: term, mode: "insensitive" },
                    };
                }),
                ...searchTerms.map((term) => {
                    return {
                        title: { contains: term, mode: "insensitive" },
                    };
                }),
                ...searchTerms.map((term) => {
                    return { tags: { has: term } };
                }),
                {
                    author: {
                        OR: [
                            ...searchTerms.map((term) => {
                                return {
                                    firstname: {
                                        contains: term,
                                        mode: "insensitive",
                                    },
                                };
                            }),
                            ...searchTerms.map((term) => {
                                return {
                                    lastname: {
                                        contains: term,
                                        mode: "insensitive",
                                    },
                                };
                            }),
                            ...searchTerms.map((term) => {
                                return {
                                    username: {
                                        contains: term,
                                        mode: "insensitive",
                                    },
                                };
                            }),
                        ],
                    },
                },
            ],
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
                },
            },
        },
    });
    let usersData = users.map((user) => {
        return {
            id: user.id,
            fullname: (0, index_1.capitalize)(`${user.firstname} ${user.lastname}`),
            bio: user.bio,
            affiliation: user.affiliation,
            cover: user.user_image.cover_name,
            pfp: user.user_image.pfp_name,
            address: (0, index_1.capitalize)(`${user.address.barangay}, ${user.address.municipality}, ${user.address.province}`),
            username: user.username,
        };
    });
    let projectData = projects.map((post) => {
        return {
            id: post.id,
            title: post.title,
            context: post.context,
            media: post.media,
            liked_by_users_id: post.liked_by_users_id,
            createdAt: post.createdAt,
            tags: post.tags,
            comments: post.comments.map((comment) => {
                return {
                    id: comment.id, // Fix: Access the 'id' property from the 'comment' object
                    content: comment.content,
                    createdAt: comment.createdAt,
                    up_voted_by_users_id: comment.up_voted_by_users_id,
                    down_voted_by_users_id: comment.down_voted_by_users_id,
                    author: {
                        id: comment.author.id,
                        fullname: (0, index_1.capitalize)(`${comment.author.firstname} ${comment.author.lastname}`),
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
                fullname: (0, index_1.capitalize)(`${post.author.firstname} ${post.author.lastname}`),
                bio: post.author.bio,
                affiliation: post.author.affiliation,
                cover: post.author.user_image.cover_name,
                pfp: post.author.user_image.pfp_name,
                address: (0, index_1.capitalize)(`${post.author.address.barangay}, ${post.author.address.municipality}, ${post.author.address.province}`),
                username: post.author.username,
            },
        };
    });
    let postsData = posts.map((post) => {
        return {
            id: post.id,
            title: post.title,
            context: post.context,
            media: post.media,
            liked_by_users_id: post.liked_by_users_id,
            createdAt: post.createdAt,
            tags: post.tags,
            comments: post.comments.map((comment) => {
                return {
                    id: comment.id, // Fix: Access the 'id' property from the 'comment' object
                    content: comment.content,
                    createdAt: comment.createdAt,
                    up_voted_by_users_id: comment.up_voted_by_users_id,
                    down_voted_by_users_id: comment.down_voted_by_users_id,
                    author: {
                        id: comment.author.id,
                        fullname: (0, index_1.capitalize)(`${comment.author.firstname} ${comment.author.lastname}`),
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
                fullname: (0, index_1.capitalize)(`${post.author.firstname} ${post.author.lastname}`),
                bio: post.author.bio,
                affiliation: post.author.affiliation,
                cover: post.author.user_image.cover_name,
                pfp: post.author.user_image.pfp_name,
                address: (0, index_1.capitalize)(`${post.author.address.barangay}, ${post.author.address.municipality}, ${post.author.address.province}`),
                username: post.author.username,
            },
        };
    });
    return res.send({
        status: "success",
        data: { posts: postsData, users: usersData, projects: projectData },
    });
};
exports.searchController = {
    search,
};
