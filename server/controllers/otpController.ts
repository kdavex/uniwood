import { FastifyRequest, FastifyReply } from "../types/fastify.d";
import {
  sendRegistrationOTP as mailRegistrationOtp,
  sendPasswordChangeTicketLink,
} from "../utils/mailer";
import { randomInt, randomBytes } from "node:crypto";
import { hashSync, compareSync } from "bcrypt";
import { registerOTPDuration } from "../config/recordDuration";

const sendRegisterOtp = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  res: FastifyReply,
) => {
  const { email } = req.body;

  // chekck if email already exist;
  const userExist = await req.prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
    },
  });
  if (userExist)
    return res
      .status(400)
      .send({ status: "fail", message: "Email already exist" });

  const sixDigitOtp = randomInt(100000, 999999).toString();
  const hashedSixDigitOtp = hashSync(sixDigitOtp, 10);

  try {
    // Sent OTP via email
    mailRegistrationOtp({ to: req.body.email }, { otp: sixDigitOtp.split("") });

    // delete previous OTP
    await req.prisma.registerOTP.deleteMany({
      where: {
        email,
      },
    });

    // Save hashedOTP in DB
    const otpDoc = await req.prisma.registerOTP.create({
      data: {
        email,
        otp: hashedSixDigitOtp,
      },
    });

    // Delete OTP after 30 minutes
    setTimeout(async () => {
      req.prisma.registerOTP.delete({
        where: {
          id: otpDoc.id,
        },
      });
    }, registerOTPDuration);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "fail",
      message: "Internal server error",
    });
  }
  return res.status(200).send({
    status: "success",
    message: "OTP sent successfully",
  });
};

const verifyRegistrationOtp = async (
  req: FastifyRequest<{ Body: { email: string; otp: string } }>,
  res: FastifyReply,
) => {
  const emailExist = await req.prisma.registerOTP.findUnique({
    where: {
      email: req.body.email,
    },
    select: {
      email: true,
      otp: true,
    },
  });


  // Check if email exist
  if (!emailExist)
    return res.status(404).send({
      status: "fail",
      error: "EmailNotFound",
      message: "Email not found",
    });

  console.log(compareSync(req.body.otp, emailExist.otp));

  // Check if otpMatched matched
  console.log(req.body.otp, emailExist.otp)
  if (!compareSync(req.body.otp, emailExist.otp))
    return res.status(400).send({
      status: "fail",
      error: "InvalidOTP",
      message: "Invalid OTP",
    });

  // Delete OTP after verification
  await req.prisma.registerOTP.delete({
    where: {
      email: req.body.email,
    },
  });

  return res.status(200).send({
    status: "success",
    message: "OTP verified successfully",
  });
};

export const otpController = {
  sendRegisterOtp,
  verifyRegistrationOtp,
};
