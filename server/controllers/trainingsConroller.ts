import { FastifyRequest, FastifyReply } from "../types/fastify";

const getTrainings = async (req: FastifyRequest, res: FastifyReply) => {
  const trainings = await req.prisma.trainings.findMany({
    where: {
      status: "PUBLISHED",
    },
  });

  return res.code(200).send({ status: "success", data: trainings });
};

const updateTraining = async (
  req: FastifyRequest<{
    Body: {
      trainingId: string;
      title: string;
      description: string;
      link: string;
    };
  }>,
  res: FastifyReply,
) => {
  // find training
  const trainingDoc = await req.prisma.trainings.findUnique({
    where: { id: req.body.trainingId },
  });
  if (!trainingDoc)
    return res.code(404).send({
      status: "fail",
      error: "TrainingNotFound",
      message: "Training not found",
    });

  // Update training
  const updatedTraining = await req.prisma.trainings.update({
    where: { id: req.body.trainingId },
    data: {
      title: req.body.title || trainingDoc.title,
      description: req.body.description || trainingDoc.description,
      link: req.body.link || trainingDoc.link,
    },
  });

  return res.code(200).send({ status: "success", data: updatedTraining });
};

const deleteTraining = async (
  req: FastifyRequest<{
    Params: { trainingId: string };
  }>,
  res: FastifyReply,
) => {
  // Find training
  const trainingDoc = await req.prisma.trainings.findUnique({
    where: { id: req.params.trainingId },
  });
  if (!trainingDoc)
    return res.code(404).send({
      status: "fail",
      error: "TrainingNotFound",
      message: "Training not found",
    });

  // Delete training
  await req.prisma.trainings.delete({
    where: { id: req.params.trainingId },
  });

  return res.code(200).send({ status: "success" });
};

const createTraining = async (
  req: FastifyRequest<{
    Body: {
      title: string;
      description: string;
      link: string;
    };
  }>,
  res: FastifyReply,
) => {
  // Create training
  const newTraining = await req.prisma.trainings.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      link: req.body.link,
    },
  });

  return res.code(201).send({ status: "success", data: newTraining });
};

const trainingsController = {
  getTrainings,
  updateTraining,
  deleteTraining,
  createTraining,
};

export default trainingsController;
