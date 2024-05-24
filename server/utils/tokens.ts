import jwt from "jsonwebtoken";
import path from "node:path";
import dotenv from "dotenv";
import type { FastifyReply } from "../types/fastify.d";
import { accessTokenOption, refreshTokenOptions } from "../config/jwtOption";
import "@fastify/cookie";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../types/global.d";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const createAccessToken = (userInfo: {
  email: string;
  id: string;
  userFullname: string;
  username: string;
}) => {
  return jwt.sign(
    userInfo as AccessTokenPayload,
    process.env.ACCESS_TOKEN_KEY as string,
    accessTokenOption,
  );
};

export const createRefreshToken = (userInfo: { email: string; id: string }) => {
  return jwt.sign(
    userInfo as RefreshTokenPayload,
    process.env.REFRESH_TOKEN_KEY as string,
    refreshTokenOptions,
  );
};

export const sendRefreshToken = (token: string, res: FastifyReply) => {
  res.setCookie("refreshToken", token, {
    httpOnly: true,
    path: "/refresh_token",
    sameSite: "none",
    secure: true,
    partitioned: true,
  });
};

export const sendAccessToken = (
  userInfo: {
    id: string;
    role: string;
    accountStatus: string;
  },
  token: string,
  res: FastifyReply,
) => {
  return res.send({
    status: "success",
    accessToken: token,
    ...userInfo,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_KEY!) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_KEY!,
  ) as RefreshTokenPayload;
};
