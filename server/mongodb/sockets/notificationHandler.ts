import { Server, Socket } from "socket.io";
import { MongodbInstane } from "../dbConnect";
import { INotificationDocument } from "../../types";
import { ChangeStreamDocument, ObjectId } from "mongodb";
import { capitalize } from "../../utils";

// **
// * Notification Change Handler
// *  Socket Events:
// *       [notification/user_id] - Emit notification to the respective user

export const NotificationChangeHandler = async (io: Server, socket: Socket) => {
  const db = await new MongodbInstane().getDbInstance();

  const collection = db.collection("Notification");
  const changeStream = collection.watch();

  const sendNotification = async (
    change: ChangeStreamDocument<INotificationDocument>
  ) => {
    let socketEvent: string | null = null;
    let payload: Omit<
      INotificationDocument & AdditionalProps,
      "_id" | "updatedAt"
    > | null = null;

    if (change.operationType === "insert") {
      socketEvent = change.fullDocument.notifTo_id.toString();
      const notifBy = await db.collection("User").findOne(
        { _id: new ObjectId(change.fullDocument.notifFrom_id) },
        {
          projection: {
            id: 1,
            firstname: 1,
            lastname: 1,
            username: 1,
            "user_image.pfp_name": 1,
          },
        }
      );
      if (!notifBy) throw new Error("User not found");

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
              fullname: capitalize(`${notifBy.firstname} ${notifBy.lastname}`),
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
              fullname: capitalize(`${notifBy.firstname} ${notifBy.lastname}`),
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
              fullname: capitalize(`${notifBy.firstname} ${notifBy.lastname}`),
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

interface AdditionalProps {
  id: string;
  notifBy: {
    id: string;
    fullname: string;
    username: string;
    pfp: string;
  };
}
