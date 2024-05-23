"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
require("@fastify/multipart");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_socket_io_1 = __importDefault(require("fastify-socket.io"));
const index_1 = require("./config/index");
const index_2 = require("./routes/index");
const index_3 = require("./hooks/index");
const index_4 = require("./mongodb/sockets/index");
const notificationHandler_1 = require("./mongodb/sockets/notificationHandler");
// import { authorizeWS } from "./middlewares/authorize";
dotenv_1.default.config({
    path: node_path_1.default.resolve(__dirname, ".env"),
});
const app = (0, fastify_1.default)();
// ===== CORE PLUGINS ===== //
app.register(cors_1.default, index_1.corsOption);
app.register(multipart_1.default, index_1.multipartOption);
app.register(cookie_1.default, index_1.cookieOption);
app.register(static_1.default, index_1.statisCoption);
app.register(fastify_socket_io_1.default, index_1.socketIOOption);
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
app.addHook("onRequest", index_3.onRequestHook);
// ====== ROUTES ===== //
app.register(index_2.UsersRoute, { prefix: "/users" });
app.register(index_2.TestRoute);
app.register(index_2.LoginRoute, { prefix: "/login" });
app.register(index_2.LogoutRoute, { prefix: "/logout" });
app.register(index_2.RefreshTokenRoute, { prefix: "/refresh_token" });
app.register(index_2.PostsRoute, { prefix: "/posts" });
app.register(index_2.CommentsRoute, { prefix: "/comments" });
app.register(index_2.ProjectsRoute, { prefix: "/projects" });
app.register(index_2.SearchRoute, { prefix: "/search" });
app.register(index_2.ConverseRoute, { prefix: "/converse" });
app.register(index_2.NotificationRoute, {
    prefix: "/notifications",
});
app.register(index_2.OtpRoute, { prefix: "/otp" });
app.ready((err) => {
    if (err)
        throw err;
    app.io.on("connection", onConnection);
    // Change Stream Handlers
});
app.get("/", async (req, res) => {
    return { status: "success", message: "Welcome to the API" };
});
app.listen({
    port: parseInt(process.env.SERVER_PORT),
    host: process.env.SERVER_HOST,
}, (err, address) => {
    if (err)
        throw err;
    console.log(`Server listening at ${address}`);
});
//! Test
// ====== Sockets ===== //
const onConnection = (socket) => {
    socket.on("test", (message, cb) => {
        // const cookies = parse(socket.request.headers.cookie!);
        socket.emit("test", message);
        socket.broadcast.emit("test", message);
    });
    console.log("Socket Connected");
    (0, index_4.messageChangeHandler)(app.io, socket);
    (0, notificationHandler_1.NotificationChangeHandler)(app.io, socket);
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
exports.default = app;
