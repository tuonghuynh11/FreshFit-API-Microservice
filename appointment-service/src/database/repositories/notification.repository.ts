// export const createNotification = async ({
//   socket,
//   dataSource,
//   content,
//   contentType,
//   actions,
//   assignee,
//   createdBy,
//   title,
//   image,
// }: ICreateNotification) => {
//   const notificationRepository = dataSource.getRepository(Notification);
//   const userRepository = dataSource.getRepository(User);

import { ICreateNotification } from "../../utils/interfaces";

//   const user =
//     typeof assignee === "string"
//       ? await userRepository.findOneBy({ id: assignee })
//       : assignee;

//   if (!user) {
//     throw new NotFoundError("Assignee (of notification) is not found.");
//   }
//   const notification = notificationRepository.create({
//     content,
//     contentType,
//     actions,
//     assignee: user,
//     createdBy,
//     title,
//     image,
//   });

//   await notificationRepository.save(notification);

//   if (socket) {
//     // Send notification to the sender
//     socket.emit("notification", {
//       ...notification,
//       assignee: {
//         id: notification.assignee.id,
//         avatar: notification.assignee.avatar,
//         displayName: notification.assignee.displayName,
//       },
//     });

//     // Send notification to all client except the sender
//     socket.broadcast.emit("notification", {
//       ...notification,
//       assignee: {
//         id: notification.assignee.id,
//         avatar: notification.assignee.avatar,
//         displayName: notification.assignee.displayName,
//       },
//     });
//   }
// };
export const createNotification = async ({
  socket,
  dataSource,
  content,
  contentType,
  actions,
  assignee,
  createdBy,
  title,
  image,
}: ICreateNotification) => {};
