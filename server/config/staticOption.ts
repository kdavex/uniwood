import { FastifyStaticOptions } from "@fastify/static";
import path from "node:path";
export const statisCoption: FastifyStaticOptions = {
  root: path.resolve(__dirname, "../public"),
  prefix: "/public/",
};
