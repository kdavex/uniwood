import { FastifyReply, FastifyRequest } from "../types/fastify.d";
import { sendPasswordChangeTicketLink } from "../utils/mailer";
import { randomBytes, randomInt } from "node:crypto";
import { hashSync, compareSync } from "bcrypt";
import { passwordChangeTicketDuration } from "../config/recordDuration";

const sendTicketForResetPassword = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  res: FastifyReply,
) => {
  // Check if email exist
  const emailExist = await req.prisma.user.findUnique({
    where: { email: req.body.email },
    select: {
      id: true,
      credential: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!emailExist)
    return res.code(404).send({
      status: "fail",
      error: "UserNotRegistered",
      message: "Email not found",
    });

  // GenerateTicket
  const ticket = randomBytes(64).toString("base64url");

  // send ticket via email
  try {
    sendPasswordChangeTicketLink({ to: req.body.email }, { ticket: ticket });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "fail",
      error: "MailError",
      message: "Mail not sent",
    });
  }

  // Save ticket in DB
  await req.prisma.passwordChangeTicket.create({
    data: {
      ticket,
      user_id: emailExist.id,
      credential_id: emailExist.credential!.id,
    },
  });

  // Delete ticket after 30 minutes
  setTimeout(async () => {
    await req.prisma.passwordChangeTicket.delete({
      where: {
        ticket,
      },
    });
  }, passwordChangeTicketDuration);

  return res.status(200).send({
    status: "success",
    message: "Ticket sent successfully",
  });
};

const resetPassword = async (
  req: FastifyRequest<{
    Params: { ticket: string };
    Body: { newPassword: string };
  }>,
  res: FastifyReply,
) => {
  // Check if ticket Exist
  const ticketExist = await req.prisma.passwordChangeTicket.findUnique({
    where: { ticket: req.params.ticket },
    select: {
      credential_id: true,
      Credential: {
        select: {
          password: true,
        },
      },
    },
  });
  if (!ticketExist)
    return res
      .status(404)
      .send({
        status: "fail",
        error: "TicketNotFount",
        message: "Ticket not found",
      });

  if (req.body.newPassword === undefined)
    return res.status(400).send({
      status: "fail",
      error: "MissingField",
      message: ["newPassword"],
    });

  // Check if password is the same
  if (compareSync(req.body.newPassword, ticketExist.Credential.password))
    return res.status(400).send({
      status: "fail",
      error: "SamePassword",
      message: "Password cannot be the same",
    });

  // Update password
  const hashedPassowrd = hashSync(req.body.newPassword, 10);
  await req.prisma.credential.update({
    where: {
      id: ticketExist.credential_id,
    },
    data: {
      password: hashedPassowrd,
    },
  });

  // Delete ticket after verification
  await req.prisma.passwordChangeTicket.delete({
    where: {
      ticket: req.params.ticket,
    },
  });

  return res.status(200).send({
    status: "success",
    message: "Password changed successfully",
  });
};

export const credentialController = {
  sendTicketForResetPassword,
  resetPassword,
};
