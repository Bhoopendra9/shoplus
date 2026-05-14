import nodemailer from "nodemailer";
import logger from "./logger.js";

async function sendMail({ to, subject, html }) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    logger.error("Email .envs are not available");
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    logger.error("Error sending email: ", error);
  }
}

export default sendMail;
