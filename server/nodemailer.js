import nodemailer from "nodemailer";
import "dotenv/config";

let nodeMail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "mhanto0712@gmail.com",
    pass: process.env.SMTP_SECRET,
  },
});

export default nodeMail;
