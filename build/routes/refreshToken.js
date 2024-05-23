"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRoute = void 0;
const refreshToken_1 = __importDefault(require("../controllers/refreshToken"));
function RefreshTokenRoute(instance, _options, done) {
    instance.post("/", refreshToken_1.default.refreshToken);
    done();
}
exports.RefreshTokenRoute = RefreshTokenRoute;
