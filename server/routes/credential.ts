import { FastifyInstance } from "fastify";
import { credentialController } from "../controllers/credentialController";

export function CredentialRoute(
  instance: FastifyInstance,
  options: any,
  done: () => void,
) {
  instance.post(
    "/resetPassword/sendTicket",
    credentialController.sendTicketForResetPassword,
  );

  instance.patch(
    "/resetPassword/verify/:ticket",
    credentialController.resetPassword,
  );
  done();
}
