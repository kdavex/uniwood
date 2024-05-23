import { FastifyInstance } from "fastify";
import trainingsController from "../controllers/trainingsConroller";

export function TrainingsRoute(
  instance: FastifyInstance,
  option: any,
  done: () => void,
) {
  instance.get("/", trainingsController.getTrainings);
  instance.post("/", trainingsController.createTraining);
  instance.put("/", trainingsController.updateTraining);
  instance.delete("/:trainingId", trainingsController.deleteTraining);
  done();
}
