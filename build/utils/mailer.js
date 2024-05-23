"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRegistrationOTP = void 0;
const nodemailer_1 = require("nodemailer");
const node_path_1 = __importDefault(require("node:path"));
const transporter = (0, nodemailer_1.createTransport)({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});
const ejs_1 = __importDefault(require("ejs"));
async function sendRegistrationOTP({ to }, { otp }) {
    let mailOptions = {
        to: to,
        subject: "Account Verification Code",
        html: await ejs_1.default.renderFile(`${node_path_1.default.resolve(__dirname, "../views/otp.ejs")}`, { otp }),
        from: `"Uniwood NO-REPLY" <${process.env.MAIL_USERNAME}> `,
    };
    try {
        let mailInfo = await transporter.sendMail(mailOptions);
        return mailInfo;
    }
    catch (error) {
        try {
            let mailInfo = await transporter.sendMail(mailOptions);
            return [mailInfo, null];
        }
        catch (error) {
            throw error;
        }
    }
}
exports.sendRegistrationOTP = sendRegistrationOTP;
