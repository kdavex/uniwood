import { ServerOptions } from "socket.io";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const socketIOOption = {
  cors: {
    origin: [
      `https://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`,
      `https://localhost:${process.env.CLIENT_PORT}`,
    ],
    credentials: true,
  },
} as ServerOptions;

