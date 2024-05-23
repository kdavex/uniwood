"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsRoute = void 0;
const postsController_1 = __importDefault(require("../controllers/postsController"));
const authorize_1 = require("../middlewares/authorize");
const postsHandler_1 = require("../services/postsHandler");
function PostsRoute(instance, _option, done) {
    instance.get("/", { preValidation: [(0, authorize_1.authorize)("ANY")] }, postsController_1.default.getAllPosts);
    instance.get("/:postId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, postsController_1.default.getPostById);
    instance.get("/user/:usernameOrId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, postsController_1.default.getAllUserPost);
    // instance.get(
    //   "/:postId",
    //   { preValidation: [authorize("ANY")] },
    //   postController.getPost
    // );
    instance.post("/", {
        preValidation: [(0, authorize_1.authorize)("ANY"), postsHandler_1.postsCustomMultipartConsumer],
        onResponse: postsHandler_1.postPostOnresponseHander,
    }, postsController_1.default.createPost);
    instance.put("/", {
        preValidation: [(0, authorize_1.authorize)("ANY"), postsHandler_1.postsCustomMultipartConsumer],
        onResponse: postsHandler_1.postPutOnresponseHander,
    }, postsController_1.default.updatePost);
    instance.delete("/:postId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, postsController_1.default.deletePost);
    instance.patch("/likeToggle", { preValidation: [(0, authorize_1.authorize)("ANY")] }, postsController_1.default.likePostToggle);
    instance.get("/topTags", postsController_1.default.getTopTags);
    done();
    instance.get("/recommended", { preValidation: [(0, authorize_1.authorize)("ANY")] }, postsController_1.default.getRecommendedPosts);
}
exports.PostsRoute = PostsRoute;
