"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutRoute = void 0;
const logoutController_1 = __importDefault(require("../controllers/logoutController"));
function LogoutRoute(instance, _option, done) {
    instance.post("/", logoutController_1.default.logout);
    done();
}
exports.LogoutRoute = LogoutRoute;
