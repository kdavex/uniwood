"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.sendAccessToken = exports.sendRefreshToken = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const jwtOption_1 = require("../config/jwtOption");
require("@fastify/cookie");
dotenv_1.default.config({
    path: node_path_1.default.resolve(__dirname, "../../.env"),
});
const createAccessToken = (userInfo) => {
    return jsonwebtoken_1.default.sign(userInfo, process.env.ACCESS_TOKEN_KEY, jwtOption_1.accessTokenOption);
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (userInfo) => {
    return jsonwebtoken_1.default.sign(userInfo, process.env.REFRESH_TOKEN_KEY, jwtOption_1.refreshTokenOptions);
};
exports.createRefreshToken = createRefreshToken;
const sendRefreshToken = (token, res) => {
    res.setCookie("refreshToken", token, {
        httpOnly: true,
        path: "/refresh_token",
        sameSite: "none",
        secure: true,
        partitioned: true,
    });
};
exports.sendRefreshToken = sendRefreshToken;
const sendAccessToken = (userInfo, token, res) => {
    return res.send({ status: "success", accessToken: token, ...userInfo });
};
exports.sendAccessToken = sendAccessToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_KEY);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_KEY);
};
exports.verifyRefreshToken = verifyRefreshToken;
