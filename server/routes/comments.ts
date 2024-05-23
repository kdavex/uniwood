import { FastifyInstance } from "../types/fastify";
import commentController from "../controllers/commentController";
import { authorize } from "../middlewares/authorize";

export function CommentsRoute(
  instance: FastifyInstance,
  _option: any,
  done: () => void,
) {
  instance.get(
    "/",
    { preValidation: [authorize("ANY")] },
    commentController.getComments,
  );

  instance.get(
    "/:commentId",
    { preValidation: [authorize("ANY")] },
    commentController.getComment,
  );
  instance.post(
    "/",
    { preValidation: [authorize("ANY")] },
    commentController.createComment,
  );
  instance.put(
    "/",
    { preValidation: [authorize("ANY")] },
    commentController.updateComment,
  );
  instance.patch(
    "/upVoteToggle",
    { preValidation: [authorize("ANY")] },
    commentController.upVoteToggle,
  );
  instance.patch(
    "/downVoteToggle",
    { preValidation: [authorize("ANY")] },
    commentController.downVoteToggle,
  );
  instance.delete(
    "/",
    { preValidation: [authorize("ANY")] },
    commentController.deleteComment,
  );
  instance.post(
    "/reply",
    { preValidation: [authorize("ANY")] },
    commentController.replyComment,
  );
  done();
}
