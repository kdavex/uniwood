import { Server, Socket } from "socket.io";
import { MongodbInstane } from "../dbConnect";
import { IMessage, IMessageDocument } from "../../types";
import { ChangeStreamDocument } from "mongodb";

import { updateUnreadMessagesCount } from "../../models";
import { PrismaClient } from "@prisma/client";
import { capitalize } from "../../utils";

interface IReadMessagePayload {
  converse_id: string;
  user_id: string;
}

// ** Message Change Handler
// *  Socket Events:
// *       [messgage/converse_id] - Emit message to the respective conversation
// *       [converseList/recipient_id & author_id] - Emit message to the respective conversation
export const messageChangeHandler = async (io: Server, socket: Socket) => {
  const db = await new MongodbInstane().getDbInstance();

  const collection = db.collection("Message");
  const changeStream = collection.watch();

  const sendMessage = (change: ChangeStreamDocument<IMessageDocument>) => {
    let socketEvent: string | undefined;
    let payload: IMessage | undefined;

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

  const updateConverseList = async (
    change: ChangeStreamDocument<IMessageDocument>
  ) => {
    let socketEventForAuthor: string | undefined;
    let socketEventForRecipient: string | undefined;
    let payload: (IMessage & UpdateAddProps) | undefined;

    if (change.operationType === "insert") {
      socketEventForAuthor = change.fullDocument.author_id;
      socketEventForRecipient = change.fullDocument.recipient_id;

      const prisma = new PrismaClient();
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

      if (!recipientInfo) return;

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
        fullname: capitalize(
          `${recipientInfo.firstname} ${recipientInfo.lastname}`
        ),
      };
    }
    if (!payload) return;

    if (socketEventForAuthor)
      socket.emit(`converseList/${socketEventForAuthor}`, payload);

    if (socketEventForRecipient)
      socket.emit(`converseList/${socketEventForRecipient}`, payload);
  };

  const readMessage = async (
    payload: Partial<IReadMessagePayload>,
    res: (response: object) => void
  ) => {
    try {
      if (payload.user_id !== undefined && payload.converse_id !== undefined) {
        await updateUnreadMessagesCount(payload.user_id, payload.converse_id);
        res({ status: "success" });
      } else res({ status: "fail", message: "Invalid Payload" });
    } catch (error) {
      console.log(error);
      res({ status: "fail", message: error.message });
    }
  };

  changeStream.on("change", updateConverseList);
  changeStream.on("change", sendMessage);
  socket.on("read_message", readMessage);
};

interface UpdateAddProps {
  fullname: string;
  pfp: string;
}
