import fastify from "fastify";
import dotenv from "dotenv";
import path from "node:path";
import fastifyCookie from "@fastify/cookie";
import "@fastify/multipart";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifySocketIO from "fastify-socket.io";
import type { FastifyInstance } from "./types/fastify.d";
import { Socket } from "socket.io";
import {
  corsOption,
  multipartOption,
  statisCoption,
  socketIOOption,
  cookieOption,
} from "./config/index";
import {
  ConverseRoute,
  UsersRoute,
  PostsRoute,
  NotificationRoute,
  LoginRoute,
  LogoutRoute,
  RefreshTokenRoute,
  SearchRoute,
  ProjectsRoute,
  CommentsRoute,
  TestRoute,
  OtpRoute,
  CredentialRoute,
  AddressRoute,
  ArticlesRoute,
  TrainingsRoute,
  ReportRoute,
} from "./routes/index";
import { onRequestHook } from "./hooks/index";
import { messageChangeHandler } from "./mongodb/sockets/index";
import { NotificationChangeHandler } from "./mongodb/sockets/notificationHandler";

// import { authorizeWS } from "./middlewares/authorize";
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = fastify() as FastifyInstance;

// ===== CORE PLUGINS ===== //
app.register(fastifyCors, corsOption);
app.register(fastifyMultipart, multipartOption);
app.register(fastifyCookie, cookieOption);
app.register(fastifyStatic, statisCoption);
app.register(fastifySocketIO, socketIOOption);

// ======= Decorators ======== //

// ===== HOOKS ===== //
app.addHook("onError", (_req, _res, error, done) => {
  console.log(error);
  done();
});
app.addHook("preValidation", (req, _res, done) => {
  console.log({
    RuequestInfo: {
      path: req.url,
      isMultipart: req.isMultipart(),
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
    },
  });
  done();
});
app.addHook("onRequest", onRequestHook);

// ====== ROUTES ===== //
app.register(UsersRoute, { prefix: "/users" });
app.register(TestRoute);
app.register(LoginRoute, { prefix: "/login" });
app.register(LogoutRoute, { prefix: "/logout" });
app.register(RefreshTokenRoute, { prefix: "/refresh_token" });
app.register(PostsRoute, { prefix: "/posts" });
app.register(CommentsRoute, { prefix: "/comments" });
app.register(ProjectsRoute, { prefix: "/projects" });
app.register(SearchRoute, { prefix: "/search" });
app.register(ConverseRoute, { prefix: "/converse" });
app.register(NotificationRoute, {
  prefix: "/notifications",
});
app.register(CredentialRoute, { prefix: "/credentials" });
app.register(OtpRoute, { prefix: "/otp" });
app.register(AddressRoute, { prefix: "/address" });
app.register(ArticlesRoute, { prefix: "/articles" });
app.register(TrainingsRoute, { prefix: "/trainings" });
app.register(ReportRoute, { prefix: "/reports" });

app.ready((err) => {
  if (err) throw err;
  app.io.on("connection", onConnection);

  // Change Stream Handlers
});

app.get("/", async (req, res) => {
  return { status: "success", message: "Welcome to the API" };
});

app.listen(
  {
    port: parseInt(process.env.SERVER_PORT as string),
    host: process.env.SERVER_HOST as string,
  },
  (err, address) => {
    if (err) throw err;
    console.log(`Server listening at ${address}`);
  },
);

//! Test

// ====== Sockets ===== //
const onConnection = (socket: Socket) => {
  socket.on("test", (message, cb) => {
    // const cookies = parse(socket.request.headers.cookie!);
    socket.emit("test", message);
    socket.broadcast.emit("test", message);
  });

  console.log("Socket Connected");
  messageChangeHandler(app.io, socket);
  NotificationChangeHandler(app.io, socket);
};

app.get("/socket", (req, res) => {
  app.io.emit("secured", "This is a secured message");
  res.send({ status: "success" });
  app.io.emit("test", "Hello from server");
});
app.get("/cookie", (req, res) => {
  res.setCookie("hello", "world", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    partitioned: true,
  });
  return res.send({ status: "success", message: "cookie sent" });
});

export default app;
