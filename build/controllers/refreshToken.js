"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../utils/index");
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
dotenv_1.default.config({
    path: node_path_1.default.resolve(__dirname, "../../.env"),
});
const refreshToken = async (req, res) => {
    // Check if refresh token exist
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken)
        return res.code(401).send({
            status: "fail",
            error: "Missing RefeshToken Cookie",
            message: "Unauthorized",
        });
    // Check if token is valid
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(oldRefreshToken, process.env.REFRESH_TOKEN_KEY);
    }
    catch (error) {
        console.error(error);
        return res.code(401).send({
            status: "fail",
            error: "TokenMalformed",
            message: "Unauthorize",
        });
    }
    // replace tokens
    const refreshToken = (0, index_1.createRefreshToken)({
        email: payload.email,
        id: payload.id,
    });
    const accessToken = (0, index_1.createAccessToken)({
        email: payload.email,
        id: payload.id,
        userFullname: payload.userFullname,
        username: payload.username,
    });
    // sendTokens
    (0, index_1.sendRefreshToken)(refreshToken, res);
    return (0, index_1.sendAccessToken)({
        id: payload.id,
    }, accessToken, res);
};
const refrehTokenController = { refreshToken };
exports.default = refrehTokenController;
