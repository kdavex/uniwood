"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const mongodb_1 = require("mongodb");
const utils_1 = require("../utils");
const checker_1 = require("../utils/checker");
const createUser = async (req, res) => {
    // Check if Email
    const emailExist = await req.prisma.user.findUnique({
        where: { email: req.body.email },
        include: { credential: true },
    });
    if (emailExist)
        return res.status(409).send({
            status: "fail",
            error: "ValidationError",
            errorFields: [{ field: "email", message: "Email already exist" }],
        });
    // Check if username exist
    const usernameExist = await req.prisma.user.findUnique({
        where: { username: req.body.username },
    });
    if (usernameExist)
        return res.status(409).send({
            status: "fail",
            error: "ValidationError",
            errorFields: [{ field: "username", message: "Username already exist" }],
        });
    // TODO Add a valition
    // TODO Add a default PFP and Cover image
    // hash Password
    const hashedPassword = await (0, bcrypt_1.hash)(req.body.password.replace(" ", ""), 10);
    const userId = new mongodb_1.ObjectId().toHexString();
    // Create User & Credential
    try {
        await req.prisma.user.create({
            data: {
                id: userId,
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase().replace(/w/, ""),
                firstname: req.body.firstname.replace(/w(2, )/, " ").trim(),
                middlename: req.body.middlename.replace(/w(2, )/, " ").trim(),
                lastname: req.body.lastname.replace(/w(2, )/, " ").trim(),
                bio: req.body.bio?.replace(/w(2, )/, " ").trim(),
                date_of_Birth: new Date(req.body.dateOfBirth),
                gender: req.body.gender.toUpperCase(),
                role: "USER",
                address: {
                    barangay: req.body.barangay.replace(/w(2, )/, " ").trim(),
                    municipality: req.body.municipality.replace(/w(2, )/, " ").trim(),
                    province: req.body.province.replace(/w(2, )/, " ").trim(),
                },
                affiliation: req.body.affiliation
                    .toUpperCase()
                    .replace(" ", "_"),
                user_image: {
                    pfp_name: req.body?.pfp?.filename ?? "default-pfp.jpg", // TODO add default pfp
                    cover_name: req.body?.cover?.filename ?? "default-cover.jpg", // TODO add default cover
                },
                credential: {
                    create: {
                        email: req.body.email.toLowerCase(),
                        password: hashedPassword,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "fail",
            message: "Internal Server Error",
        });
    }
    // Move files to public folder
    (0, utils_1.moveFile)([req.body?.pfp, req.body?.cover], "tmp", "public");
    const accessToken = (0, utils_1.createAccessToken)({
        email: req.body.email,
        id: userId,
        username: req.body.username,
        userFullname: (0, utils_1.capitalize)(`${req.body.firstname} ${req.body.lastname}`),
    });
    const refreshToken = (0, utils_1.createRefreshToken)({
        email: req.body.email,
        id: userId,
    });
    (0, utils_1.sendRefreshToken)(refreshToken, res);
    return res.code(201).send({
        status: "success",
        message: "User Successfully Created",
        data: {
            id: userId,
            accessToken: accessToken,
        },
    });
};
const updateUser = async (req, res) => {
    // TODO Add authorization if the user is the same as the one updating or an Admin
    // Check if id exist
    if (req.body.id === undefined)
        return res.status(400).send({ status: "fail", message: "Missing User Id" });
    // Check if user exist
    let userExist = await req.prisma.user.findUnique({
        where: { id: req.body.id },
        include: { credential: true },
    });
    if (!userExist) {
        userExist = await req.prisma.user.findUnique({
            where: { username: req.body.id },
            include: { credential: true },
        });
    }
    if (!userExist)
        return res.status(404).send({
            status: "fail",
            message: "User not found",
        });
    // TODO Add validation
    // Update USER
    const hashedPassword = req.body.password && (await (0, bcrypt_1.hash)(req.body.password, 10));
    try {
        await req.prisma.user.update({
            where: { id: req.body.id },
            data: {
                username: req.body.username ?? userExist.username,
                firstname: req.body.firstname ?? userExist.firstname,
                middlename: req.body.middlename ?? userExist.middlename,
                lastname: req.body.lastname ?? userExist.lastname,
                bio: req.body.bio ?? userExist.bio,
                date_of_Birth: new Date(req.body.dateOfBirth || userExist.date_of_Birth),
                gender: req.body.gender ?? userExist.gender,
                address: {
                    update: {
                        barangay: req.body.barangay ?? userExist.address.barangay,
                        municipality: req.body.municipality ?? userExist.address.municipality,
                        province: req.body.province ?? userExist.address.province,
                    },
                },
                affiliation: req.body.affiliation ?? userExist.affiliation,
                user_image: {
                    pfp_name: req.body.pfp?.filename ?? userExist.user_image.pfp_name,
                    cover_name: req.body.cover?.filename ?? userExist.user_image.cover_name,
                },
                credential: {
                    update: {
                        email: req.body.email ?? userExist?.credential?.email,
                        password: hashedPassword ?? userExist?.credential?.password,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.code(500).send({
            status: "fail",
            error: "DBError",
            message: "Internal Server Error",
        });
    }
    // Delete old Files
    // if (req.body.pfp) removeFiles([userExist.user_image.pfp_name], "public");
    // if (req.body.cover) removeFiles([userExist.user_image.cover_name], "public");
    // Move files to public folder
    (0, utils_1.moveFile)([req.body?.pfp, req.body?.cover], "tmp", "public");
    return res.send({ status: "success", message: "User Successfully Updated" });
};
const deleteUser = async (req, res) => {
    // TODO Add authorization if the user is the same as the one deleting or an Admin
    // Check if id exist
    if (req.body.id == null)
        return res.status(400).send({ status: "fail", message: "Missing User Id" });
    // Check if user exist
    const userExist = await req.prisma.user.findUnique({
        where: { id: req.body.id },
    });
    if (!userExist)
        return res.status(404).send({
            status: "fail",
            message: "User not found",
        });
    // Delete User
    const deleteUser = await req.prisma.user.delete({
        where: { id: req.body.id },
        select: { id: true }
    });
    return res.send({
        status: "success",
        message: "User Successfully Deleted",
        data: {
            id: deleteUser.id,
        }
    });
};
const getAllusers = async (req, res) => {
    // TODO Add authorization if the user is the same as the one deleting or an Admin
    const allusers = await req.prisma.user.findMany({});
    return res.send({
        status: "success",
        message: "Successfully fetched all users",
        data: allusers,
    });
};
const getNewUsers = async (req, res) => {
    // TODO Add authorization if the user is the same as the one deleting or an Admin
    const allusers = await req.prisma.user.findMany({
        take: parseInt(req.query.count),
        orderBy: { date_joined: "desc" },
        select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            user_image: true,
            address: true,
            affiliation: true,
            bio: true,
        },
    });
    let data = allusers.map((user) => {
        return {
            id: user.id,
            username: user.username,
            fullname: (0, utils_1.capitalize)(`${user.firstname} ${user.lastname}`),
            cover: user.user_image.cover_name,
            pfp: user.user_image.pfp_name,
            address: (0, utils_1.capitalize)(`${user.address.barangay}, ${user.address.municipality}, ${user.address.province}`),
            bio: user.bio,
            affiliation: (0, utils_1.constantToCapitalize)(user.affiliation),
        };
    });
    return res.send({
        status: "success",
        message: "Successfully fetched all users",
        data: data,
    });
};
const getUser = async (req, res) => {
    // TODO Add authorization if the user is logged
    // Check if id exist
    if (req.params.id == null)
        return res.status(400).send({ status: "fail", message: "Missing User Id" });
    // Check get user
    let user;
    try {
        if ((0, checker_1.isValidObjectId)(req.params.id)) {
            user = await req.prisma.user.findFirst({
                where: {
                    id: req.params.id,
                },
                include: {
                    followers: {
                        select: {
                            id: true,
                        },
                    },
                    following: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
        }
        else {
            console.log("Finding by username");
            user = await req.prisma.user.findFirst({
                where: {
                    username: req.params.id,
                },
                include: {
                    followers: {
                        select: {
                            id: true,
                        },
                    },
                    following: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "fail",
            message: "User not found",
        });
    }
    if (!user) {
        return res.status(404).send({
            status: "fail",
            message: "User not found",
        });
    }
    return res.send({
        status: "success",
        message: "Successfully fetched user",
        data: {
            id: user.id,
            fullname: (0, utils_1.capitalize)(`${user.firstname} ${user.lastname}`),
            cover: user.user_image.cover_name,
            pfp: user.user_image.pfp_name,
            address: (0, utils_1.capitalize)(`${user.address.barangay}, ${user.address.municipality}, ${user.address.province}`),
            username: user.username,
            bio: user.bio,
            dateOfBirth: user.date_of_Birth,
            affiliation: (0, utils_1.constantToCapitalize)(user.affiliation),
            gender: (0, utils_1.constantToCapitalize)(user.gender),
            email: user.email,
            followersCount: user.followers.length,
            followingCount: user.following.length,
        },
    });
};
const getUserRawData = async (req, res) => {
    let user = await req.prisma.user.findUnique({
        where: { username: req.params.usernameOrId },
        select: {
            id: true,
            username: true,
            firstname: true,
            middlename: true,
            lastname: true,
            bio: true,
            date_of_Birth: true,
            user_image: true,
            address: true,
            affiliation: true,
            gender: true,
        },
    });
    if ((0, checker_1.isValidObjectId)(req.params.usernameOrId) && !user) {
        user = await req.prisma.user.findUnique({
            where: { id: req.params.usernameOrId },
            select: {
                id: true,
                username: true,
                firstname: true,
                middlename: true,
                lastname: true,
                bio: true,
                date_of_Birth: true,
                user_image: true,
                address: true,
                gender: true,
                affiliation: true,
            },
        });
    }
    if (!user)
        return res.status(404).send({
            status: "fail",
            message: "User not found",
        });
    let userdata = {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        middlename: user.middlename,
        lastname: user.lastname,
        bio: user.bio,
        dateOfBirth: user.date_of_Birth,
        pfp: user.user_image.pfp_name,
        cover: user.user_image.cover_name,
        affiliation: (0, utils_1.constantToCapitalize)(user.affiliation),
        gender: (0, utils_1.constantToCapitalize)(user.gender),
        province: (0, utils_1.capitalize)(user.address.province),
        municipality: (0, utils_1.capitalize)(user.address.municipality),
        barangay: (0, utils_1.capitalize)(user.address.barangay),
    };
    return res.code(200).send({
        status: "success",
        message: "Successfully fetched user",
        data: userdata,
    });
};
const getRecommendedAccountsForNewUser = async (req, res) => {
    // TODO add algorithm to get recommended accounts for new Users
    let recommendedAccountsDocs = await req.prisma.user.findMany({
        take: parseInt("5"),
        select: {
            id: true,
            firstname: true,
            lastname: true,
            bio: true,
            email: true,
            user_image: true,
            address: true,
            date_of_Birth: true,
            gender: true,
            username: true,
            affiliation: true,
        },
    });
    recommendedAccountsDocs = recommendedAccountsDocs.filter((rmAccount) => rmAccount.id !== req.userId);
    const recommendedAccounts = recommendedAccountsDocs.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: (0, utils_1.capitalize)(`${user.firstname} ${user.lastname}`),
        cover: user.user_image.cover_name,
        gender: user.gender,
        pfp: user.user_image.pfp_name,
        affiliation: (0, utils_1.constantToCapitalize)(user.affiliation),
        address: (0, utils_1.capitalize)(`${user.address.barangay}, ${user.address.municipality}, ${user.address.province}`),
        bio: user.bio,
        dateOfBirth: user.date_of_Birth,
    }));
    return res.code(200).send({ status: "success", recommendedAccounts });
};
const followUser = async (req, res) => {
    try {
        await req.prisma.user.update({
            where: { id: req.userId },
            data: {
                following: {
                    connect: { id: req.query.userId },
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "fail",
            error: "Database Erorr",
            message: "Unable to follow user",
        });
    }
    return res
        .code(200)
        .send({ status: "success", message: "Successfully followed" });
};
const unfollowUser = async (req, res) => {
    try {
        await req.prisma.user.update({
            where: { id: req.userId },
            data: {
                following: {
                    disconnect: { id: req.query.userId },
                },
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.code(500).send({
            status: "fail",
            error: "Database Error",
            message: "Unable to unfollow user",
        });
    }
    return res
        .code(200)
        .send({ status: "success", message: "Successfully unfollowed" });
};
const addInterests = async (req, res) => {
    // To lowercase
    req.body.interests = req.body.interests.map((interest) => interest.toLowerCase());
    try {
        let eInterestDoc = await req.prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                interests: true,
            },
        });
        if (eInterestDoc == null)
            throw Error("User not found");
        eInterestDoc.interests.forEach((interest) => {
            if (!req.body.interests.includes(interest)) {
                req.body.interests.push(interest);
            }
        });
        // Save Interest
        await req.prisma.user.update({
            where: { id: req.userId },
            data: {
                interests: {
                    set: req.body.interests,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "fail",
            error: "DB Error",
            message: error,
        });
    }
    return res
        .code(200)
        .send({ status: "success", message: "Successfully added interests" });
};
const searchUsers = async (req, res) => {
    let usersDoc = await req.prisma.user.findMany({
        where: {
            OR: [
                {
                    username: {
                        contains: req.query.q,
                        mode: "insensitive",
                    },
                },
                {
                    firstname: {
                        contains: req.query.q,
                        mode: "insensitive",
                    },
                },
                {
                    lastname: {
                        contains: req.query.q,
                        mode: "insensitive",
                    },
                },
            ],
        },
    });
    let parsedUsersData = usersDoc.map((user) => {
        return {
            id: user.id,
            fullname: (0, utils_1.capitalize)(`${user.firstname} ${user.lastname}`),
            affiliation: (0, utils_1.constantToCapitalize)(user.affiliation),
            bio: user.bio || "",
            dateOfBirth: user.date_of_Birth.toDateString(),
            gender: (0, utils_1.constantToCapitalize)(user.gender),
            address: (0, utils_1.capitalize)(`${user.address.barangay}, ${user.address.municipality}, ${user.address.province}`),
            email: user.email,
            username: user.username,
            pfp: user.user_image.pfp_name,
            cover: user.user_image.cover_name,
        };
    });
    return res.code(200).send({ status: "success", data: parsedUsersData });
};
const verifyUserIfFollowed = async (req, res) => {
    const targetUserDoc = await req.prisma.user.findFirst({
        where: {
            id: req.query.targetUser,
        },
        select: {
            id: true,
        },
    });
    if (!targetUserDoc)
        return res
            .code(404)
            .send({ status: "success", data: { isFollowed: false } });
    const isFollowed = await req.prisma.user.findFirst({
        where: {
            id: req.userId,
            following_ids: {
                has: targetUserDoc.id,
            },
        },
        select: {
            id: true,
        },
    });
    if (!isFollowed)
        return res
            .code(404)
            .send({ status: "success", data: { isFollowed: false } });
    return res.code(200).send({ status: "success", data: { isFollowed: true } });
};
const getFollowers = async (req, res) => {
    let followersDoc;
    if ((0, checker_1.isValidObjectId)(req.query.targetUserId)) {
        followersDoc = await req.prisma.user.findUnique({
            where: { id: req.query.targetUserId },
            select: {
                followers: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        user_image: true,
                        bio: true,
                        address: true,
                        affiliation: true,
                    },
                },
            },
        });
    }
    else {
        followersDoc = await req.prisma.user.findUnique({
            where: { username: req.query.targetUserId },
            select: {
                followers: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        user_image: true,
                        bio: true,
                        address: true,
                        affiliation: true,
                    },
                },
            },
        });
    }
    const userFollowedAccountsDoc = await req.prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            following: {
                select: {
                    id: true,
                },
            },
        },
    });
    const parsedFollowersData = followersDoc?.followers.map((follower) => {
        return {
            id: follower.id,
            fullname: (0, utils_1.capitalize)(`${follower.firstname} ${follower.lastname}`),
            username: follower.username,
            pfp: follower.user_image.pfp_name,
            cover: follower.user_image.cover_name,
            bio: follower.bio,
            address: (0, utils_1.capitalize)(`${follower.address.barangay}, ${follower.address.municipality}, ${follower.address.province}`),
            affiliation: (0, utils_1.constantToCapitalize)(follower.affiliation),
            followedByTheUer: userFollowedAccountsDoc?.following.some((userFollowedAcc) => userFollowedAcc.id === follower.id) ?? false,
        };
    });
    return res.code(200).send({ status: "success", data: parsedFollowersData });
};
const getFollowings = async (req, res) => {
    let followingDoc;
    if ((0, checker_1.isValidObjectId)(req.query.targetUserId)) {
        followingDoc = await req.prisma.user.findUnique({
            where: { id: req.query.targetUserId },
            select: {
                following: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        user_image: true,
                        bio: true,
                        address: true,
                        affiliation: true,
                    },
                },
            },
        });
    }
    else {
        followingDoc = await req.prisma.user.findUnique({
            where: { username: req.query.targetUserId },
            select: {
                following: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        user_image: true,
                        bio: true,
                        address: true,
                        affiliation: true,
                    },
                },
            },
        });
    }
    const parsedFollowersData = followingDoc?.following.map((follower) => {
        return {
            id: follower.id,
            fullname: (0, utils_1.capitalize)(`${follower.firstname} ${follower.lastname}`),
            username: follower.username,
            pfp: follower.user_image.pfp_name,
            cover: follower.user_image.cover_name,
            bio: follower.bio,
            address: (0, utils_1.capitalize)(`${follower.address.barangay}, ${follower.address.municipality}, ${follower.address.province}`),
            affiliation: (0, utils_1.constantToCapitalize)(follower.affiliation),
        };
    });
    console.log({ parsedFollowersData });
    return res.code(200).send({ status: "success", data: parsedFollowersData });
};
const userController = {
    createUser,
    updateUser,
    deleteUser,
    getAllusers,
    getUser,
    getUserRawData,
    getNewUsers,
    getRecommendedAccountsForNewUser,
    followUser,
    unfollowUser,
    addInterests,
    searchUsers,
    verifyUserIfFollowed,
    getFollowings,
    getFollowers,
};
exports.default = userController;
