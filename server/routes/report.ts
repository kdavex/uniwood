import { FastifyInstance } from "fastify";
import reportController from "../controllers/reportController";
import { authorize } from "../middlewares/authorize";

// TODO  change authorization
export function ReportRoute(
  instance: FastifyInstance,
  option: any,
  done: () => void,
) {
  instance.post(
    "/comment",
    { preValidation: [authorize("USER")] },
    reportController.reportComment,
  );
  instance.post(
    "/post",
    {
      preValidation: [authorize("USER")],
    },
    reportController.reportPost,
  );
  instance.get(
    "/commentCount/:userId",
    reportController.getUsersTotalCommnentReport,
  );
  instance.get("/postCount/:userId", reportController.getUsersTotalPostReport);
  instance.patch("/comment", reportController.updateCommentReportStatus);
  instance.patch("/post", reportController.updatePostReportStatus);

  instance.get("/comment", reportController.getCommentReports);
  instance.get("/post", reportController.getPostReports);
  instance.delete("/", reportController.deleteReport);

  done();
}
