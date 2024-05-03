import { FastifyInstance, FastifyPluginCallback } from "fastify";
import {
  UsersRoute,
  TestRoute,
  LoginRoute,
  LogoutRoute,
  RefreshTokenRoute,
  PostsRoute,
  CommentsRoute,
  ProjectsRoute,
  SearchRoute,
  NotificationRoute,
} from "./routes";
import ConverseRoute from "./routes/converse";
import { messageChangeHandler } from "./mongodb/sockets";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifySocketIO from "fastify-socket.io";
import { Socket } from "socket.io";
import {
  corsOption,
  multipartOption,
  cookieOption,
  statisCoption,
  socketIOOption,
} from "./config";
import { onRequestHook } from "./hooks";
import { NotificationChangeHandler } from "./mongodb/sockets/notificationHandler";

export default function App(
  instance: FastifyInstance,
  options: any,
  done: () => void,
) {
  // ===== CORE PLUGINS ===== //
  instance.register(fastifyCors, corsOption);
  instance.register(fastifyMultipart, multipartOption);
  instance.register(fastifyCookie, cookieOption);
  instance.register(fastifyStatic, statisCoption);
  instance.register(fastifySocketIO, socketIOOption);

  // ===== HOOKS ===== //
  instance.addHook("onError", (_req, _res, error, done) => {
    console.log(error);
    done();
  });
  instance.addHook("preValidation", (req, _res, done) => {
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
  instance.addHook("onRequest", onRequestHook);

  // ====== ROUTES ===== //
  instance.register(UsersRoute, { prefix: "/users" });
  instance.register(TestRoute);
  instance.register(LoginRoute, { prefix: "/login" });
  instance.register(LogoutRoute, { prefix: "/logout" });
  instance.register(RefreshTokenRoute, { prefix: "/refresh_token" });
  instance.register(PostsRoute, { prefix: "/posts" });
  instance.register(CommentsRoute, { prefix: "/comments" });
  instance.register(ProjectsRoute, { prefix: "/projects" });
  instance.register(SearchRoute, { prefix: "/search" });
  instance.register(ConverseRoute, { prefix: "/converse" });
  instance.register(NotificationRoute, {
    prefix: "/notifications",
  });

  const onConnection = (socket: Socket) => {
    socket.on("test", (message, cb) => {
      // const cookies = parse(socket.request.headers.cookie!);
      socket.emit("test", message);
      socket.broadcast.emit("test", message);
    });

    console.log("Socket Connected");
    messageChangeHandler(instance.io, socket);
    NotificationChangeHandler(instance.io, socket);
  };

  instance.get("/socket", (req, res) => {
    instance.io.emit("secured", "This is a secured message");
    res.send({ status: "success" });
    instance.io.emit("test", "Hello from server");
  });
  instance.get("/cookie", (req, res) => {
    res.setCookie("hello", "world", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      partitioned: true,
    });
    return res.send({ status: "success", message: "cookie sent" });
  });

  instance.ready((err) => {
    if (err) throw err;
    instance.io.on("connection", onConnection);

    // Change Stream Handlers
  });

  done();
}
