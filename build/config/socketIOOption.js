"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIOOption = void 0;
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: node_path_1.default.resolve(__dirname, "../../.env") });
exports.socketIOOption = {
    cors: {
        origin: [
            `https://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`,
            `https://localhost:${process.env.CLIENT_PORT}`,
        ],
        credentials: true,
    },
};
