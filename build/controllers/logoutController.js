"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logout = async (_req, res) => {
    res.clearCookie("refreshToken", {
        path: "/refresh_token",
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });
    return res.send({ status: "success", message: "Logout success" });
};
const logoutController = { logout };
exports.default = logoutController;
