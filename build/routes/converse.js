"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverseRoute = void 0;
const converseController_1 = require("../controllers/converseController");
const authorize_1 = require("../middlewares/authorize");
const multipartConsumer_1 = require("../middlewares/multipartConsumer");
function ConverseRoute(instance, option, done) {
    instance.post("/sendMessage", { preValidation: [(0, authorize_1.authorize)("USER"), multipartConsumer_1.arbitraryMultipartConsumer] }, converseController_1.converseController.sendMessage);
    instance.get("/search", { preValidation: [(0, authorize_1.authorize)("USER")] }, converseController_1.converseController.searchConversation);
    instance.get("/", { preValidation: [(0, authorize_1.authorize)("USER")] }, converseController_1.converseController.getConverse);
    instance.get("/list", { preValidation: [(0, authorize_1.authorize)("USER")] }, converseController_1.converseController.getConverseList);
    instance.get("/recipient", { preValidation: [(0, authorize_1.authorize)("USER")] }, converseController_1.converseController.getRecipient);
    instance.get("/media", { preValidation: [(0, authorize_1.authorize)("USER")] }, converseController_1.converseController.getConverseMedia);
    done();
}
exports.ConverseRoute = ConverseRoute;
