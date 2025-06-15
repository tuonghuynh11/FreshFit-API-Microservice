import { Server } from "socket.io";
import Logger from "../utils/logger";

class SocketNotificationService {
  private static instance: SocketNotificationService;
  private io: Server;

  private constructor(io: Server) {
    this.io = io;
  }

  /**
   * Initialize the SocketNotificationService once with Socket.IO instance
   */
  public static initialize(io: Server) {
    if (!SocketNotificationService.instance) {
      SocketNotificationService.instance = new SocketNotificationService(io);
      Logger.info("SocketNotificationService initialized");
    }
    return SocketNotificationService.instance;
  }

  /**
   * Get the already initialized instance
   */
  public static getInstance(): SocketNotificationService {
    if (!SocketNotificationService.instance) {
      throw new Error(
        "SocketNotificationService is not initialized. Call initialize(io) first."
      );
    }
    return SocketNotificationService.instance;
  }

  public emitToUser(
    userId: string,
    payload: { title: string; message: string; data?: any }
  ) {
    this.io.to(userId).emit("notification", payload);
    Logger.info(`Emit to user ${userId}: ${payload.title}`);
  }

  public emitToAll(payload: { title: string; message: string; data?: any }) {
    this.io.emit("notification", payload);
    Logger.info(`Emit to all users: ${payload.title}`);
  }

  public joinUserRoom(socket: any, userId: string) {
    socket.join(userId);
    Logger.info(`Socket ${socket.id} joined room ${userId}`);
  }
}

export default SocketNotificationService;
