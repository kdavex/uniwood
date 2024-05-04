import userController from "../controllers/usersController";
import { multipartConsumer } from "../middlewares/multipartConsumer";
import { userPutOnResponseHandler, usersPostOnResponseHandler, } from "../services/usersHandler.ts";
import { authorize } from "../middlewares/authorize.ts";
export function UsersRoute(instance, _options, done) {
    instance.get("/newUsers", userController.getNewUsers);
    instance.get("/", userController.getAllusers);
    instance.get("/:id", userController.getUser);
    instance.delete("/", userController.deleteUser);
    instance.put("/", {
        preValidation: [authorize("ANY"), multipartConsumer],
        onResponse: userPutOnResponseHandler,
    }, userController.updateUser);
    instance.post("/", {
        preValidation: [multipartConsumer],
        onResponse: usersPostOnResponseHandler,
    }, userController.createUser);
    instance.get("/raw/:usernameOrId", { preValidation: [authorize("ANY")] }, userController.getUserRawData);
    instance.get("/register/recommendedAccounts", userController.getRecommendedAccountsForNewUser);
    instance.patch("/follow", { preValidation: [authorize("ANY")] }, userController.followUser);
    instance.patch("/unfollow", { preValidation: [authorize("ANY")] }, userController.unfollowUser);
    instance.patch("/addInterest", { preValidation: [authorize("USER")] }, userController.addInterests);
    instance.get("/search", { preValidation: [authorize("USER")] }, userController.searchUsers);
    instance.get("/verifyIfFollowed", { preValidation: [authorize("USER")] }, userController.verifyUserIfFollowed);
    instance.get("/followers", { preValidation: [authorize("USER")] }, userController.getFollowers);
    instance.get("/following", {
        preValidation: [authorize("USER")],
        handler: userController.getFollowings,
    });
    done();
}
