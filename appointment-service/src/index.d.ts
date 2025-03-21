import "express";
import { Transporter } from "nodemailer";
import { Socket } from "socket.io";
import { DataSource } from "typeorm";

declare global {
  namespace Express {
    interface Locals {
      dataSource: DataSource;
      socket: Socket;
      nodeMailer: Transporter;
    }
  }
}
