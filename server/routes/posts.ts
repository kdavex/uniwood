import { FastifyInstance } from "../types/fastify";
import postController from "../controllers/postsController";
import { authorize } from "../middlewares/authorize";
import {
  postPostOnresponseHander,
  postPutOnresponseHander,
  postsCustomMultipartConsumer,
} from "../services/postsHandler";

export function PostsRoute(
  instance: FastifyInstance,
  _option: any,
  done: () => void,
) {
  instance.get(
    "/",
    { preValidation: [authorize("ANY")] },
    postController.getAllPosts,
  );
  instance.get("/:postId", postController.getPostById);

  instance.get(
    "/user/:usernameOrId",
    { preValidation: [authorize("ANY")] },
    postController.getAllUserPost,
  );

  instance.post(
    "/",
    {
      preValidation: [authorize("ANY"), postsCustomMultipartConsumer],
      onResponse: postPostOnresponseHander,
    },
    postController.createPost,
  );
  instance.put(
    "/",
    {
      preValidation: [authorize("ANY"), postsCustomMultipartConsumer],
      onResponse: postPutOnresponseHander,
    },
    postController.updatePost,
  );
  instance.delete("/:postId", postController.deletePost);
  instance.patch(
    "/likeToggle",
    { preValidation: [authorize("ANY")] },
    postController.likePostToggle,
  );
  instance.get("/topTags", postController.getTopTags);

  instance.get(
    "/recommended",
    { preValidation: [authorize("ANY")] },
    postController.getRecommendedPosts,
  );
  instance.patch("/unarchivePost/:postId", postController.unArchivePost);
  done();
}
