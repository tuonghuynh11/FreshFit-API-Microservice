import { Socket } from "socket.io";
import { MediaType, SystemRole } from "./enums";
import { DataSource } from "typeorm";

export interface IAuthorize {
  roles: SystemRole[] | string;
  handlerName: string | symbol;
}

export interface Media {
  url: string;
  type: MediaType;
}
export interface ProfitCalculation {
  orderId: string;
  revenue: number;
  cogs: number;
  deliveryCost: number;
  discount: number;
  profit: number;
}

export interface ICreateNotification {
  socket: Socket;
  dataSource: DataSource;
  message: string;
  actions?: any;
  user_id: string;
  title: string;
}
