"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.converseController = exports.getRecipient = exports.getConverseList = exports.getConverse = exports.searchConversation = exports.createConverse = exports.sendMessage = void 0;
const mongodb_1 = require("mongodb");
const converseOperations_1 = require("../models/converseOperations");
const stringFormatter_1 = require("../utils/stringFormatter");
const fileManager_1 = require("../utils/fileManager");
const sendMessage = async (req, res) => {
    // Check if body is complete
    if (req.body.recipient_id == undefined ||
        (req.body.chat === undefined && req.body.media === undefined))
        return res.status(400).send({
            status: "fail",
            message: "FieldError",
            fieldError: [
                { field: "recipient_id", message: "Missing recipient_id" },
                { field: "chat or media", message: "Missing chat or media" },
            ],
        });
    // unread count
    const unreadDoc = (await req.prisma.converse.findFirst({
        where: {
            messengers_id: { hasEvery: [req.userId, req.body.recipient_id] },
        },
        select: {
            unread: true,
        },
    })) || {
        unread: [
            { user_id: req.userId, count: 0 },
            { user_id: req.body.recipient_id, count: 0 },
        ],
    };
    // increment unread count
    unreadDoc.unread = unreadDoc.unread.map((unread) => {
        if (unread.user_id === req.body.recipient_id) {
            unread.count += 1;
        }
        return unread;
    });
    let converseDoc;
    try {
        const converseDocExist = await (0, converseOperations_1.converseDocExistByMessengersId)([
            req.body.recipient_id,
            req.userId,
        ]);
        converseDoc = await req.prisma.converse.upsert({
            where: {
                id: converseDocExist?.id || "111111111111111111111111", // dummy id
            },
            create: {
                messages: {
                    create: {
                        type: req.body.type,
                        chat: req.body.chat,
                        media: req.body.media,
                        createdAt: new Date(),
                        status: "SENT",
                        author_id: req.userId,
                        recipient_id: req.body.recipient_id,
                    },
                },
                unread: unreadDoc.unread,
                messengers: {
                    connect: [{ id: req.userId }, { id: req.body.recipient_id }],
                },
            },
            update: {
                messages: {
                    create: {
                        id: new mongodb_1.ObjectId().toHexString(),
                        author_id: req.userId,
                        type: req.body.type,
                        chat: req.body.chat,
                        media: req.body.media,
                        createdAt: new Date(),
                        status: "SENT",
                        recipient_id: req.body.recipient_id,
                    },
                },
                unread: unreadDoc.unread,
            },
        });
    }
    catch (error) {
        console.error(error);
        (0, fileManager_1.removeFiles)(req.body.media?.map((media) => media.filename) || [], "tmp");
        return res
            .status(500)
            .send({ status: "fail", message: "Internal Server Error" });
    }
    // Save media to public folder
    if (req.body.type !== "TEXT")
        (0, fileManager_1.moveFile)(req.body.media?.map((media) => media.filename) || [], "tmp", "public");
    return res.code(201).send({
        status: "success",
        converseId: converseDoc.id,
        message: "Message Saved",
    });
};
exports.sendMessage = sendMessage;
const createConverse = async (req, res) => { };
exports.createConverse = createConverse;
const searchConversation = async (req, reply) => {
    const converseDoc = await req.prisma.converse.findFirst({
        where: {
            messengers_id: { hasEvery: [req.query.recipientId, req.userId] },
        },
        select: {
            id: true,
        },
    });
    if (!converseDoc) {
        return reply.code(404).send({ status: "fail", message: "Not Found" });
    }
    return reply
        .code(200)
        .send({ stauts: "success", converseId: converseDoc.id });
};
exports.searchConversation = searchConversation;
const getConverse = async (req, res) => {
    const converseDoc = await req.prisma.converse.findUnique({
        where: {
            id: req.query.converseId,
        },
        select: {
            messages: true,
            messengers: {
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    user_image: {
                        select: {
                            pfp_name: true,
                        },
                    },
                },
            },
        },
    });
    if (!converseDoc) {
        return res.code(404).send({ status: "fail", message: "Not Found" });
    }
    let reecipiendInfo = converseDoc.messengers.find((messenger) => messenger.id !== req.userId);
    const parsedConverseDoc = {
        reecipiendInfo: {
            fullname: (0, stringFormatter_1.capitalize)(`${reecipiendInfo?.firstname} ${reecipiendInfo?.lastname}`),
            username: reecipiendInfo?.username,
            pfp: reecipiendInfo?.user_image.pfp_name,
            id: reecipiendInfo?.id,
        },
        messages: converseDoc.messages,
    };
    return res.code(200).send({ status: "success", data: parsedConverseDoc });
};
exports.getConverse = getConverse;
const getConverseList = async (req, res) => {
    // Get converse doc list
    const conversesDoc = await req.prisma.converse.findMany({
        where: {
            messengers_id: { has: req.userId },
        },
        select: {
            id: true,
            messages: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
            },
            messengers: {
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    user_image: {
                        select: {
                            pfp_name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    if (!conversesDoc) {
        return res.code(404).send({ status: "fail", message: "Not Found" });
    }
    // get the first message and parse the recipients info
    const parseConversesDoc = conversesDoc.map((converse) => {
        const recipientRaw = converse.messengers.find((user) => user.id !== req.userId);
        console.log({ recipientRaw });
        const recipientInfo = {
            fullname: `${recipientRaw.firstname} ${recipientRaw.lastname}`,
            pfp: recipientRaw.user_image.pfp_name,
        };
        return {
            authorId: converse.messages[0].author_id,
            converseId: converse.id,
            message: converse.messages[0],
            recipientInfo,
        };
    });
    // set messages status from the recipient to DELIVERED
    await req.prisma.converse.updateMany({
        where: {
            messengers_id: { has: req.userId },
        },
        data: {},
    });
    return res.code(200).send({ status: "success", data: parseConversesDoc });
};
exports.getConverseList = getConverseList;
const getRecipient = async (req, res) => {
    const recipientDoc = await req.prisma.converse.findUnique({
        where: {
            id: req.query.converseId,
        },
        select: {
            messengers: {
                where: {
                    id: { not: req.userId },
                },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    username: true,
                    user_image: {
                        select: {
                            pfp_name: true,
                        },
                    },
                },
            },
        },
    });
    if (recipientDoc === null)
        return res.code(404).send({ status: "fail", message: "Not Found" });
    const pareseReicipientDoc = {
        id: recipientDoc.messengers[0].id,
        fullname: (0, stringFormatter_1.capitalize)(`${recipientDoc?.messengers[0].firstname} ${recipientDoc?.messengers[0].lastname}`),
        username: recipientDoc.messengers[0].username,
        pfp: recipientDoc.messengers[0].user_image.pfp_name,
    };
    return res.code(200).send({ status: "success", data: pareseReicipientDoc });
};
exports.getRecipient = getRecipient;
const getConverseMedia = async (req, reply) => {
    console.log({ query: req.query, tsest: "Hello World" });
    const mediaList = await req.prisma.message.findMany({
        where: {
            converse_id: req.query.converseId,
            type: { in: ["IMAGE", "VIDEO"] },
            Conversation: {
                messengers_id: {
                    hasSome: [req.userId, req.query.recipientId],
                },
            },
        },
        select: {
            media: true,
            type: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return reply.code(200).send({ status: "success", data: mediaList });
};
exports.converseController = {
    sendMessage: exports.sendMessage,
    searchConversation: exports.searchConversation,
    getConverse: exports.getConverse,
    getConverseList: exports.getConverseList,
    getRecipient: exports.getRecipient,
    getConverseMedia,
};
