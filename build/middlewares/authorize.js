"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: node_path_1.default.resolve(__dirname, "../../.env"),
});
/**
 * Checks if user is Authorize
 * @param userRole Role of the user
 * @returns
 */
const authorize = (userRole) => {
    return async (req, res) => {
        const accessToken = req.headers.authorization?.split(" ")[1];
        if (!accessToken)
            return res.status(401).send({
                status: "fail",
                message: "Unauthorized",
                error: "No AccessToken",
            });
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        // check if user exist and roles is match
        const userExist = await req.prisma.user.findUnique({
            where: { id: payload.id },
            select: { role: true },
        });
        if (!userExist || (userExist.role !== userRole && userRole !== "ANY"))
            return res
                .status(401)
                .send({
                status: "fail",
                error: "Unauthorized",
                message: "Mismatch Role",
            });
        // attach userId
        req.userId = payload.id;
    };
};
exports.authorize = authorize;
/**
 * Checks if user is authorize in websockets. A middleware for socket.io namespace
 * @param userType Role of the user
 */
// export const authorizeWS = (userType: "USER" | "ADMIN" | "ANY") => {
//   return async (socket: Socket, next: (err?: Error) => void) => {
//     // Check if token exist
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error("Unauthorized"));
//     // Check if token is authentic
//     let tokenVerified: RefreshTokenPayload;
//     try {
//       tokenVerified = verify(
//         token,
//         process.env.REFRESH_TOKEN_KEY!
//       ) as RefreshTokenPayload;
//     } catch (error) {
//       return next(new Error("Token is not authentic"));
//     }
//     // Check if user exist
//     const userExist = await prisma.user.findUnique({
//       where: { id: tokenVerified.id },
//       select: { role: true },
//     });
//     if (!userExist) return next(new Error("User not found"));
//     // Check if user role is match
//     if (userType === "ANY") return next();
//     if (userExist.role === userType) return next();
//     return next(new Error("Unauthorized"));
//   };
// };
// export const authorizeWS
