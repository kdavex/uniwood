"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.converseDocExistByMessengersId = exports.converseDocExistsById = exports.updateUnreadMessagesCount = void 0;
const client_1 = require("@prisma/client");
/**
 * Updates the unread messsages count of a conversation
 * @param user_id user to update the unread messages
 * @param conversationId
 * @returns
 */
const prisma = new client_1.PrismaClient();
const updateUnreadMessagesCount = async (user_id, conversation_id) => {
    const converseExist = await (0, exports.converseDocExistsById)(conversation_id);
    console.log({ converseExist });
    if (!converseExist)
        throw new Error("Converse document not found");
    return await prisma.converse.update({
        where: { id: conversation_id },
        data: {
            unread: {
                updateMany: {
                    where: { user_id: user_id },
                    data: {
                        count: 0,
                    },
                },
            },
        },
    });
};
exports.updateUnreadMessagesCount = updateUnreadMessagesCount;
const converseDocExistsById = async (converes_id) => {
    return await prisma.converse.findFirst({
        where: {
            id: converes_id,
        },
    });
};
exports.converseDocExistsById = converseDocExistsById;
const converseDocExistByMessengersId = async (messengersId) => {
    return await prisma.converse.findFirst({
        where: {
            messengers_id: {
                hasEvery: messengersId,
            },
        },
        select: {
            id: true,
        },
    });
};
exports.converseDocExistByMessengersId = converseDocExistByMessengersId;
