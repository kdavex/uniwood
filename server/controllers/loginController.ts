import { Credential, User } from "@prisma/client";
import type { FastifyRequest, FastifyReply } from "../types/fastify.d";
import { compare } from "bcrypt";
import {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} from "../utils/tokens";

export const login = async (
  req: FastifyRequest<{
    Body: { usernameOrEmail: string | undefined; password: string | undefined };
  }>,
  res: FastifyReply,
) => {
  // TODO add validation

  if (req.body.usernameOrEmail === undefined)
    return res.code(401).send({
      status: "fail",
      message: "FieldError",
      fieldError: [
        { field: "usernameOrEmail", message: "Missing username or email" },
      ],
    });
  if (req.body.password === undefined)
    return res.code(401).send({
      status: "fail",
      message: "FieldError",
      fieldError: [{ field: "password", message: "Missing password" }],
    });
  // check if user exist
  let userExist: (User & { credential: Credential | null }) | null = null;

  if (req.body.usernameOrEmail.includes("@")) {
    userExist = await req.prisma.user.findUnique({
      where: {
        email: req.body.usernameOrEmail,
      },
      include: { credential: true },
    });
  } else {
    userExist = await req.prisma.user.findUnique({
      where: {
        username: req.body.usernameOrEmail,
      },
      include: { credential: true },
    });
  }
  if (!userExist || !userExist.credential)
    return res.status(404).send({
      status: "fail",
      error: "UserNotFound",
      message: "User not found",
    });

  const userFullname = userExist.firstname + " " + userExist.lastname;

  // Check if password is match
  const match = await compare(req.body.password, userExist.credential.password);

  if (!match)
    return res.status(401).send({
      status: "fail",
      error: "IncorrectPassword",
      message: "Password is incorrect",
    });

  // Create tokens
  const accessToken = createAccessToken({
    email: userExist.email,
    id: userExist.id,
    userFullname,
    username: userExist.username,
  });
  const refreshToken = createRefreshToken({
    email: userExist.email,
    id: userExist.id,
  });

  sendRefreshToken(refreshToken, res);
  return sendAccessToken(
    {
      id: userExist.id,
      role: userExist.role,
      accountStatus: userExist.account_status,
    },
    accessToken,
    res,
  );
};

const loginController = { login };

export default loginController;
