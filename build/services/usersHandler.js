"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPutOnResponseHandler = exports.usersPostOnResponseHandler = void 0;
const fileManager_1 = require("../utils/fileManager");
async function usersPostOnResponseHandler(req, res) {
    // Remove Files From Temp Folder
    if (res.statusCode === 201)
        return;
    (0, fileManager_1.removeFiles)([req.body.pfp, req.body.cover], "tmp");
}
exports.usersPostOnResponseHandler = usersPostOnResponseHandler;
async function userPutOnResponseHandler(req, res) {
    // Remove Files From Temp Folder
    if (res.statusCode === 200)
        return;
    (0, fileManager_1.removeFiles)([req.body.pfp, req.body.cover], "tmp");
}
exports.userPutOnResponseHandler = userPutOnResponseHandler;
