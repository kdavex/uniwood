"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageChangeHandler = void 0;
const dbConnect_1 = require("../dbConnect");
const models_1 = require("../../models");
const client_1 = require("@prisma/client");
const utils_1 = require("../../utils");
// ** Message Change Handler
// *  Socket Events:
// *       [messgage/converse_id] - Emit message to the respective conversation
// *       [converseList/recipient_id & author_id] - Emit message to the respective conversation
const messageChangeHandler = async (io, socket) => {
    const db = await new dbConnect_1.MongodbInstane().getDbInstance();
    const collection = db.collection("Message");
    const changeStream = collection.watch();
    const sendMessage = (change) => {
        let socketEvent;
        let payload;
        if (change.operationType === "insert") {
            console.log(change.fullDocument);
            socketEvent = change.fullDocument.converse_id.toString();
            payload = {
                id: change.fullDocument._id,
                author_id: change.fullDocument.author_id,
                converse_id: change.fullDocument.converse_id,
                type: change.fullDocument.type,
                chat: change.fullDocument.chat,
                media: change.fullDocument.media,
                createdAt: change.fullDocument.createdAt,
                status: change.fullDocument.status,
                recipient_id: change.fullDocument.recipient_id,
            };
        }
        if (socketEvent && payload) {
            socket.emit(`message/${socketEvent}`, payload);
        }
    };
    const updateConverseList = async (change) => {
        let socketEventForAuthor;
        let socketEventForRecipient;
        let payload;
        if (change.operationType === "insert") {
            socketEventForAuthor = change.fullDocument.author_id;
            socketEventForRecipient = change.fullDocument.recipient_id;
            const prisma = new client_1.PrismaClient();
            const recipientInfo = await prisma.user.findUnique({
                where: {
                    id: change.fullDocument.recipient_id,
                },
                select: {
                    firstname: true,
                    lastname: true,
                    user_image: true,
                },
            });
            if (!recipientInfo)
                return;
            payload = {
                id: change.fullDocument._id,
                author_id: change.fullDocument.author_id,
                converse_id: change.fullDocument.converse_id,
                type: change.fullDocument.type,
                chat: change.fullDocument.chat,
                media: change.fullDocument.media,
                createdAt: change.fullDocument.createdAt,
                status: change.fullDocument.status,
                recipient_id: change.fullDocument.recipient_id,
                pfp: recipientInfo.user_image.pfp_name,
                fullname: (0, utils_1.capitalize)(`${recipientInfo.firstname} ${recipientInfo.lastname}`),
            };
        }
        if (!payload)
            return;
        if (socketEventForAuthor)
            socket.emit(`converseList/${socketEventForAuthor}`, payload);
        if (socketEventForRecipient)
            socket.emit(`converseList/${socketEventForRecipient}`, payload);
    };
    const readMessage = async (payload, res) => {
        try {
            if (payload.user_id !== undefined && payload.converse_id !== undefined) {
                await (0, models_1.updateUnreadMessagesCount)(payload.user_id, payload.converse_id);
                res({ status: "success" });
            }
            else
                res({ status: "fail", message: "Invalid Payload" });
        }
        catch (error) {
            console.log(error);
            res({ status: "fail", message: error.message });
        }
    };
    changeStream.on("change", updateConverseList);
    changeStream.on("change", sendMessage);
    socket.on("read_message", readMessage);
};
exports.messageChangeHandler = messageChangeHandler;
