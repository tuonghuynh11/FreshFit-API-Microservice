import UserService from "../../services/user.services";
import { NotFoundError } from "../../utils/errors";
import { ICreateNotification } from "../../utils/interfaces";
import {
  CreateNotificationReqBody,
  NotificationType,
} from "../requests/notification.requests";

export const createNotification = async ({
  socket,
  dataSource,
  message,
  actions,
  user_id,
  title,
}: ICreateNotification) => {
  const user = await UserService.checkUserExisted({
    userId: user_id,
  });

  if (!user) {
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

  if (socket) {
    // Send notification to the sender
    socket.emit("notification", {
      ...newNotification,
      assignee: {
        id: user_id,
      },
    });

    // Send notification to all client except the sender
    socket.broadcast.emit("notification", {
      ...newNotification,
      assignee: {
        id: user_id,
      },
    });
  }
};
