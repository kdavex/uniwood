import { FastifyInstance } from "fastify";
import userController from "../controllers/usersController";
import { multipartConsumer } from "../middlewares/multipartConsumer";

import {
  userPutOnResponseHandler,
  usersPostOnResponseHandler,
} from "../services/usersHandler";
import { authorize } from "../middlewares/authorize";

export function UsersRoute(
  instance: FastifyInstance,
  _options: any,
  done: () => void,
) {
  instance.get("/newUsers", userController.getNewUsers);

  instance.get("/", userController.getAllusers);
  instance.get("/:id", userController.getUser);
  instance.delete("/", userController.deleteUser);

  instance.put(
    "/",
    {
      preValidation: [authorize("ANY"), multipartConsumer],
      onResponse: userPutOnResponseHandler,
    },
    userController.updateUser,
  );
  instance.post(
    "/",
    {
      preValidation: [multipartConsumer],
      onResponse: usersPostOnResponseHandler,
    },
    userController.createUser,
  );
  instance.get(
    "/raw/:usernameOrId",
    { preValidation: [authorize("ANY")] },
    userController.getUserRawData,
  );
  instance.get(
    "/register/recommendedAccounts",
    userController.getRecommendedAccountsForNewUser,
  );
  instance.patch(
    "/follow",
    { preValidation: [authorize("ANY")] },
    userController.followUser,
  );
  instance.patch(
    "/unfollow",
    { preValidation: [authorize("ANY")] },
    userController.unfollowUser,
  );
  instance.patch(
    "/addInterest",
    { preValidation: [authorize("USER")] },
    userController.addInterests,
  );

  instance.get(
    "/search",
    { preValidation: [authorize("USER")] },
    userController.searchUsers,
  );

  instance.get(
    "/verifyIfFollowed",
    { preValidation: [authorize("USER")] },
    userController.verifyUserIfFollowed,
  );

  instance.get(
    "/followers",
    { preValidation: [authorize("USER")] },
    userController.getFollowers,
  );

  instance.get("/following", {
    preValidation: [authorize("USER")],
    handler: userController.getFollowings,
  });

  instance.get("/existUsername/:username", userController.verifyUsernameExist);
  instance.get("/existEmail/:email", userController.verifyEmailExist);

  done();
}
