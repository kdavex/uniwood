"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChangeHandler = void 0;
const dbConnect_1 = require("../dbConnect");
const mongodb_1 = require("mongodb");
const utils_1 = require("../../utils");
// **
// * Notification Change Handler
// *  Socket Events:
// *       [notification/user_id] - Emit notification to the respective user
const NotificationChangeHandler = async (io, socket) => {
    const db = await new dbConnect_1.MongodbInstane().getDbInstance();
    const collection = db.collection("Notification");
    const changeStream = collection.watch();
    const sendNotification = async (change) => {
        let socketEvent = null;
        let payload = null;
        if (change.operationType === "insert") {
            socketEvent = change.fullDocument.notifTo_id.toString();
            const notifBy = await db.collection("User").findOne({ _id: new mongodb_1.ObjectId(change.fullDocument.notifFrom_id) }, {
                projection: {
                    id: 1,
                    firstname: 1,
                    lastname: 1,
                    username: 1,
                    "user_image.pfp_name": 1,
                },
            });
            if (!notifBy)
                throw new Error("User not found");
            switch (change.fullDocument.type) {
                case "POST_REACT":
                    payload = {
                        id: change.fullDocument._id,
                        type: change.fullDocument.type,
                        createdAt: change.fullDocument.createdAt,
                        notifFrom_id: change.fullDocument.notifFrom_id,
                        notifTo_id: change.fullDocument.notifTo_id,
                        post_id: change.fullDocument.post_id,
                        notifBy: {
                            id: notifBy._id.toString(),
                            fullname: (0, utils_1.capitalize)(`${notifBy.firstname} ${notifBy.lastname}`),
                            username: notifBy.username,
                            pfp: notifBy.user_image.pfp_name,
                        },
                    };
                    break;
                case "POST_COMMENT":
                    payload = {
                        id: change.fullDocument._id,
                        type: change.fullDocument.type,
                        createdAt: change.fullDocument.createdAt,
                        notifFrom_id: change.fullDocument.notifFrom_id,
                        notifTo_id: change.fullDocument.notifTo_id,
                        post_id: change.fullDocument.post_id,
                        comment_id: change.fullDocument.comment_id,
                        notifBy: {
                            id: notifBy._id.toString(),
                            fullname: (0, utils_1.capitalize)(`${notifBy.firstname} ${notifBy.lastname}`),
                            username: notifBy.username,
                            pfp: notifBy.user_image.pfp_name,
                        },
                    };
                    break;
                case "FOLLOW":
                    payload = {
                        id: change.fullDocument._id,
                        type: change.fullDocument.type,
                        createdAt: change.fullDocument.createdAt,
                        notifFrom_id: change.fullDocument.notifFrom_id,
                        notifTo_id: change.fullDocument.notifTo_id,
                        notifBy: {
                            id: notifBy._id.toString(),
                            fullname: (0, utils_1.capitalize)(`${notifBy.firstname} ${notifBy.lastname}`),
                            username: notifBy.username,
                            pfp: notifBy.user_image.pfp_name,
                        },
                    };
                    break;
                default:
                    break;
            }
            if (socketEvent && payload) {
                console.log(`Emitting notification to ${socketEvent}`);
                socket.emit(`notification/${socketEvent}`, payload);
            }
        }
    };
    changeStream.on("change", sendNotification);
};
exports.NotificationChangeHandler = NotificationChangeHandler;
