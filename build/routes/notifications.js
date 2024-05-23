"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoute = void 0;
const notificationController_1 = require("../controllers/notificationController");
const authorize_1 = require("../middlewares/authorize");
function NotificationRoute(fastify, _options, done) {
    fastify.get("/", { preValidation: [(0, authorize_1.authorize)("USER")] }, notificationController_1.notificationController.getNotifications);
    done();
}
exports.NotificationRoute = NotificationRoute;
