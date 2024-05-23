"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = require("bcrypt");
const tokens_1 = require("../utils/tokens");
const login = async (req, res) => {
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
    let userExist = null;
    if (req.body.usernameOrEmail.includes("@")) {
        userExist = await req.prisma.user.findUnique({
            where: {
                email: req.body.usernameOrEmail,
            },
            include: { credential: true },
        });
    }
    else {
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
    const match = await (0, bcrypt_1.compare)(req.body.password, userExist.credential.password);
    if (!match)
        return res.status(401).send({
            status: "fail",
            error: "IncorrectPassword",
            message: "Password is incorrect",
        });
    // Create tokens
    const accessToken = (0, tokens_1.createAccessToken)({
        email: userExist.email,
        id: userExist.id,
        userFullname,
        username: userExist.username,
    });
    const refreshToken = (0, tokens_1.createRefreshToken)({
        email: userExist.email,
        id: userExist.id,
    });
    (0, tokens_1.sendRefreshToken)(refreshToken, res);
    return (0, tokens_1.sendAccessToken)({
        id: userExist.id,
    }, accessToken, res);
};
exports.login = login;
const loginController = { login: exports.login };
exports.default = loginController;
