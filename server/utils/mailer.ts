import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import path from "node:path";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});
import ejs from "ejs";

export async function sendRegistrationOTP(
  { to }: { to: string },
  { otp }: { otp: string[] },
) {
  let mailOptions: Mail.Options = {
    to: to,
    subject: "Account Verification Code",
    html: await ejs.renderFile(
      `${path.resolve(__dirname, "../views/registerOTPMail.ejs")}`,
      { otp },
    ),
    from: `"Uniwood NO-REPLY" <${process.env.MAIL_USERNAME}> `,
  };

  try {
    let mailInfo = await transporter.sendMail(mailOptions);
    return mailInfo;
  } catch (error) {
    try {
      let mailInfo = await transporter.sendMail(mailOptions);
      return mailInfo;
    } catch (error) {
      throw error;
    }
  }
}

export async function sendPasswordChangeTicketLink(
  { to }: { to: string },
  { ticket }: { ticket: string },
) {
  let mailOptions: Mail.Options = {
    to: to,
    subject: "Password Reset Ticket",
    html: await ejs.renderFile(
      `${path.resolve(__dirname, "../views/changePasswordMail.ejs")}`,
      {
        ticketLink: `https://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}/resetPassword/${ticket}`,
      },
    ),
  };

  try {
    let mailInfo = await transporter.sendMail(mailOptions);
    return mailInfo;
  } catch (error) {
    try {
      let mailInfo = await transporter.sendMail(mailOptions);
      return mailInfo;
    } catch (error) {
      throw error;
    }
  }
}
