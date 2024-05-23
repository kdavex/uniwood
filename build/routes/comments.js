"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsRoute = void 0;
const commentController_1 = __importStar(require("../controllers/commentController"));
const authorize_1 = require("../middlewares/authorize");
function CommentsRoute(instance, _option, done) {
    instance.get("/", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.getComments);
    instance.get("/:commentId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.getComment);
    instance.post("/", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.createComment);
    instance.put("/", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.updateComment);
    instance.patch("/upVoteToggle", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.upVoteToggle);
    instance.patch("/downVoteToggle", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.downVoteToggle);
    instance.delete("/", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.deleteComment);
    instance.post("/reply", { preValidation: [(0, authorize_1.authorize)("ANY")] }, commentController_1.default.replyComment);
    instance.post("/test", commentController_1.test);
    done();
}
exports.CommentsRoute = CommentsRoute;
