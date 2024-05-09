import Fastify, { FastifyReply, FastifyRequest } from "fastify";

const app = Fastify({ logger: true });

app.register(import("../test/app"), { prefix: "/" });

export default async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready();
  app.server.emit("request", req, res);
};
