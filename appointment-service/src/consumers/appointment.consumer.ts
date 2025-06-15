import { QUEUE_NAMES } from "../common/constants/rabbitMq.values";
import AppointmentRepository from "../database/repositories/appointment.repository";
import Logger from "../utils/logger";
import { consumeQueue } from "../utils/rabbitmq";

/**
 * Xử lý logic đặt lịch
 */
async function processBooking(message: any) {
  const { userId, expertId, availableId, issues, notes, type } = message;
  console.log("Consumed booking req:", message);
  const result = await AppointmentRepository.addUsingRabbitMQ({
    userId,
    expertId,
    availableId,
    issues,
    notes,
    type,
  });
}
export const initializeBookingConsumer = () => {
  // Khởi động consumer để lắng nghe hàng đợi
  consumeQueue(QUEUE_NAMES.BOOKING_QUEUE, processBooking);
  Logger.info("Booking Consumer initialize success");
};
