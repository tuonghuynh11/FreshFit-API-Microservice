import fs from "fs";
import mustache from "mustache";
import { Transporter } from "nodemailer";
import Logger from "./logger";
import config from "../configuration";
import path from "path";

export const sendMail = async ({
  nodeMailer,
  emails,
  template,
  data,
}: {
  nodeMailer: Transporter;
  emails: string;
  template: string;
  data: any;
}) => {
  const templateHtml = fs.readFileSync(
    path.join(__dirname, `../templates/${template}.mustache`),
    "utf-8"
  );
  const html = mustache.render(templateHtml, data);

  const info = await nodeMailer.sendMail({
    from: `"MarketNest" <${config.smtpUser}>`,
    to: emails,
    subject: data.subject,
    html,
  });

  Logger.info(`Message sent: ${info.messageId}`);
};
