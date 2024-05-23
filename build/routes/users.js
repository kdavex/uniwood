"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoute = void 0;
const usersController_1 = __importDefault(require("../controllers/usersController"));
const multipartConsumer_1 = require("../middlewares/multipartConsumer");
const usersHandler_1 = require("../services/usersHandler");
const authorize_1 = require("../middlewares/authorize");
function UsersRoute(instance, _options, done) {
    instance.get("/newUsers", usersController_1.default.getNewUsers);
    instance.get("/", usersController_1.default.getAllusers);
    instance.get("/:id", usersController_1.default.getUser);
    instance.delete("/", usersController_1.default.deleteUser);
    instance.put("/", {
        preValidation: [(0, authorize_1.authorize)("ANY"), multipartConsumer_1.multipartConsumer],
        onResponse: usersHandler_1.userPutOnResponseHandler,
    }, usersController_1.default.updateUser);
    instance.post("/", {
        preValidation: [multipartConsumer_1.multipartConsumer],
        onResponse: usersHandler_1.usersPostOnResponseHandler,
    }, usersController_1.default.createUser);
    instance.get("/raw/:usernameOrId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, usersController_1.default.getUserRawData);
    instance.get("/register/recommendedAccounts", usersController_1.default.getRecommendedAccountsForNewUser);
    instance.patch("/follow", { preValidation: [(0, authorize_1.authorize)("ANY")] }, usersController_1.default.followUser);
    instance.patch("/unfollow", { preValidation: [(0, authorize_1.authorize)("ANY")] }, usersController_1.default.unfollowUser);
    instance.patch("/addInterest", { preValidation: [(0, authorize_1.authorize)("USER")] }, usersController_1.default.addInterests);
    instance.get("/search", { preValidation: [(0, authorize_1.authorize)("USER")] }, usersController_1.default.searchUsers);
    instance.get("/verifyIfFollowed", { preValidation: [(0, authorize_1.authorize)("USER")] }, usersController_1.default.verifyUserIfFollowed);
    instance.get("/followers", { preValidation: [(0, authorize_1.authorize)("USER")] }, usersController_1.default.getFollowers);
    instance.get("/following", {
        preValidation: [(0, authorize_1.authorize)("USER")],
        handler: usersController_1.default.getFollowings,
    });
    done();
}
exports.UsersRoute = UsersRoute;
