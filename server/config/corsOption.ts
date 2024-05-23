import { FastifyCorsOptions } from "@fastify/cors";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(__dirname, "../../.env") });
export const corsOption: FastifyCorsOptions = {
  origin: [
    `uniwood-frontend-new.vercel.app/`,
    "https://uniwood-frontend-new.vercel.app/",
    "https://uniwood-frontend-new.vercel.app:443",
    "https://uniwood-frontend-new.vercel.app:80",
    `https://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
