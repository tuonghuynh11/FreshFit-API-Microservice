import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Post } from "../decorators/handlers";
import { SOCKET_NOTIFICATION_MESSAGES } from "../common/messages/index.messages";
import SocketNotificationRepository from "../database/repositories/socket-notification.repository";

@Controller("/socket-notifications")
export default class SocketNotificationController {
  // @Get("/")
  // public async index(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const { dataSource } = req.app.locals;
  //     const { userId } = req.query;
  //     const notificationRepository = dataSource.getRepository(Notification);
  //     if (!userId) {
  //       throw new BadRequestError("User is not found.");
  //     }
  //     let criteria: FindManyOptions<Notification> = {
  //       relations: {
  //         assignee: true,
  //       },
  //       where: {
  //         assignee: { id: userId as string },
  //       },
  //       order: {
  //         createdAt: "DESC",
  //       },
  //     };
  //     const [notifications, count] = await notificationRepository.findAndCount(
  //       criteria
  //     );
  //     res.locals.data = {
  //       count,
  //       notifications: notifications.map((notification: Notification) => {
  //         return {
  //           ...notification,
  //           assignee: {
  //             avatar: notification.assignee.avatar,
  //             displayName: notification.assignee.displayName,
  //           },
  //         };
  //       }),
  //     };
  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  @Post("/emit-notification")
  public async emitNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await SocketNotificationRepository.emitNotification({
        req,
        res,
      });
      res.locals.message =
        SOCKET_NOTIFICATION_MESSAGES.EMIT_NOTIFICATION_SUCCESS;

      next();
    } catch (error) {
      next(error);
    }
  }
  // @Post("/delete")
  // public async delete(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const { dataSource } = req.app.locals;
  //     const { notificationIds } = req.body;
  //     const notificationRepository = dataSource.getRepository(Notification);
  //     await notificationRepository
  //       .createQueryBuilder()
  //       .delete()
  //       .from(Notification)
  //       .where({ id: In(notificationIds) })
  //       .execute();
  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}
