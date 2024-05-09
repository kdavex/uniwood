import * as dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyReply, FastifyRequest } from "fastify";

const app = Fastify({
  logger: true,
});

app.register(import("../app"), { prefix: "/" });

export default async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready();
  app.server.emit("request", req, res);
};
