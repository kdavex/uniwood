"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRoute = void 0;
const loginController_1 = __importDefault(require("../controllers/loginController"));
function LoginRoute(instance, _option, done) {
    instance.post("/", loginController_1.default.login);
    done();
}
exports.LoginRoute = LoginRoute;
