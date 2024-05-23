import { FastifyInstance } from "fastify";
import articleController from "../controllers/articleController";

export function ArticlesRoute(
  instance: FastifyInstance,
  option: any,
  done: () => void,
) {
  instance.get("/", articleController.getArticles);
  instance.post("/", articleController.crateArticle);
  instance.put("/", articleController.updateArticle);
  instance.delete("/:articleId", articleController.deleteArticle);

  done();
}
