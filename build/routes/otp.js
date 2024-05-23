"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRoute = void 0;
const otpController_1 = require("../controllers/otpController");
function OtpRoute(instance, option, done) {
    instance.post("/register/send", {}, otpController_1.otpController.sendRegisterOtp);
    instance.post("/register/verify", {}, otpController_1.otpController.verifyRegistrationOtp);
    done();
}
exports.OtpRoute = OtpRoute;
