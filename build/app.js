"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./routes/index");
const index_2 = require("./mongodb/sockets/index");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const fastify_socket_io_1 = __importDefault(require("fastify-socket.io"));
const config_1 = require("./config");
const index_3 = require("./hooks/index");
const notificationHandler_1 = require("./mongodb/sockets/notificationHandler");
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
dotenv_1.default.config({ path: node_path_1.default.resolve(__dirname, "../.env") });
async function app(instance, opts, done) {
    // ===== CORE PLUGINS ===== //
    instance.register(cors_1.default, config_1.corsOption);
    instance.register(multipart_1.default, config_1.multipartOption);
    instance.register(cookie_1.default, config_1.cookieOption);
    instance.register(static_1.default, config_1.statisCoption);
    instance.register(fastify_socket_io_1.default, config_1.socketIOOption);
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
    instance.addHook("onRequest", index_3.onRequestHook);
    // ====== ROUTES ===== //
    instance.register(index_1.UsersRoute, { prefix: "/users" });
    instance.register(index_1.TestRoute);
    instance.register(index_1.LoginRoute, { prefix: "/login" });
    instance.register(index_1.LogoutRoute, { prefix: "/logout" });
    instance.register(index_1.RefreshTokenRoute, { prefix: "/refresh_token" });
    instance.register(index_1.PostsRoute, { prefix: "/posts" });
    instance.register(index_1.CommentsRoute, { prefix: "/comments" });
    instance.register(index_1.ProjectsRoute, { prefix: "/projects" });
    instance.register(index_1.SearchRoute, { prefix: "/search" });
    instance.register(index_1.ConverseRoute, { prefix: "/converse" });
    instance.register(index_1.NotificationRoute, {
        prefix: "/notifications",
    });
    instance.register(index_1.OtpRoute, { prefix: "/otp" });
    const onConnection = (socket) => {
        socket.on("test", (message, cb) => {
            socket.emit("test", message);
            socket.broadcast.emit("test", message);
        });
        console.log("Socket Connected");
        (0, index_2.messageChangeHandler)(instance.io, socket);
        (0, notificationHandler_1.NotificationChangeHandler)(instance.io, socket);
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
        if (err)
            throw err;
        instance.io.on("connection", onConnection);
        // Change Stream Handlers
    });
    //! TEST
    instance.get("/test", async (_req, res) => {
        return res.code(200).send({ status: "success", message: "Test Route" });
    });
    instance.get("/", async (_req, res) => {
        return res
            .code(200)
            .send({ status: "success", message: "Welcome to the API" });
    });
    done();
}
exports.default = app;
