import { FastifyRequest, FastifyReply } from "../types/fastify";

const getArticles = async (req: FastifyRequest, res: FastifyReply) => {
  const articleDocs = await req.prisma.articles.findMany({
    where: {
      status: "PUBLISHED",
    },
  });

  return res.status(200).send({ status: "success", data: articleDocs });
};

const updateArticle = async (
  req: FastifyRequest<{
    Body: {
      articleId: string;
      title: string;
      description: string;
      link: string;
      author: string;
    };
  }>,
  res: FastifyReply,
) => {
  // Find article
  const articleDoc = await req.prisma.articles.findUnique({
    where: { id: req.body.articleId },
  });
  if (!articleDoc)
    return res.status(404).send({
      status: "fail",
      error: "ArticleNotFound",
      message: "Article not found",
    });

  // Update article
  const updatedArticle = await req.prisma.articles.update({
    where: { id: req.body.articleId },
    data: {
      title: req.body.title || articleDoc.title,
      description: req.body.description || articleDoc.description,
      link: req.body.link || articleDoc.link,
      author: req.body.author || articleDoc.author,
    },
  });

  return res.status(200).send({ status: "success", data: updatedArticle });
};

const deleteArticle = async (
  req: FastifyRequest<{
    Params: { articleId: string };
  }>,
  res: FastifyReply,
) => {
  // Find article
  const articleDoc = await req.prisma.articles.findUnique({
    where: { id: req.params.articleId },
  });
  if (!articleDoc)
    return res.status(404).send({
      status: "fail",
      error: "ArticleNotFound",
      message: "Article not found",
    });

  // Delete article
  await req.prisma.articles.update({
    where: { id: req.params.articleId },
    data: { status: "ARCHIVED" },
  });

  return res.status(200).send({ status: "success", data: articleDoc });
};

const crateArticle = async (
  req: FastifyRequest<{
    Body: {
      title: string;
      description: string;
      link: string;
      author: string;
    };
  }>,
  res: FastifyReply,
) => {
  // Create article
  const newArticle = await req.prisma.articles.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      link: req.body.link,
      author: req.body.author,
    },
  });

  return res.status(201).send({ status: "success", data: newArticle });
};

const articleController = {
  getArticles,
  updateArticle,
  deleteArticle,
  crateArticle,
};

export default articleController;
