var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config({
    path: path.resolve(import.meta.dirname, "../.env"),
});
const prisma = new PrismaClient();
/**
 * Checks if user is Authorize
 * @param userRole Role of the user
 * @returns
 */
export const authorize = (userRole) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!accessToken)
            return res.status(401).send({
                status: "fail",
                message: "Unauthorized",
                error: "No AccessToken",
            });
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        // check if user exist and roles is match
        const userExist = yield req.prisma.user.findUnique({
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
    });
};
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
