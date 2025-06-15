import { Request, Response } from "express";
import UserService from "../../services/user.services";
import { NotFoundError } from "../../utils/errors";
import {
  CreateNotificationReqBody,
  NotificationType,
} from "../requests/notification.requests";
import SocketNotificationService from "../../services/socket-notification.services";
import { DataSource } from "typeorm";
interface ICreateNotification {
  message: string;
  actions?: string; // page route
  user_id: string;
  title: string;
}
export default class SocketNotificationRepository {
  static async emitNotification({ req, res }: { req: Request; res: Response }) {
    const { message, actions, user_id, title } =
      req.body as ICreateNotification;

    try {
      const user = await UserService.checkUserExisted({
        userId: user_id,
      });
    } catch (error) {
      throw new NotFoundError("Assignee (of notification) is not found.");
    }

    const notification: CreateNotificationReqBody = {
      message,
      action: actions,
      userId: user_id,
      title,
      type: NotificationType.Other,
    };

    const newNotification = await UserService.createNotification(notification);

    SocketNotificationService.getInstance().emitToAll({
      ...newNotification,
      assignee: {
        id: user_id,
      },
    });
    SocketNotificationService.getInstance().emitToUser(user_id, {
      ...newNotification,
      assignee: {
        id: user_id,
      },
    });
  }
  static async emitNotificationLocal({
    body,
    datasource,
  }: {
    body: ICreateNotification;
    datasource: DataSource;
  }) {
    const { message, actions, user_id, title } = body as ICreateNotification;

    try {
      const user = await UserService.checkUserExisted({
        userId: user_id,
      });
    } catch (error) {
      throw new NotFoundError("Assignee (of notification) is not found.");
    }

    const notification: CreateNotificationReqBody = {
      message,
      action: actions,
      userId: user_id,
      title,
      type: NotificationType.Other,
    };

    const newNotification = await UserService.createNotification(notification);

    SocketNotificationService.getInstance().emitToAll({
      ...newNotification,
      assignee: {
        id: user_id,
      },
    });
    SocketNotificationService.getInstance().emitToUser(user_id, {
      ...newNotification,
      assignee: {
        id: user_id,
      },
    });
  }
}
