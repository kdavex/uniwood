"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRequestHook = void 0;
const client_1 = require("@prisma/client");
function onRequestHook(req, _res, done) {
    // Decorators
    req.prisma = new client_1.PrismaClient();
    done();
}
exports.onRequestHook = onRequestHook;
