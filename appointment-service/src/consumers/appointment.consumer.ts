import { QUEUE_NAMES } from "../common/constants/rabbitMq.values";
import AppointmentRepository from "../database/repositories/appointment.repository";
import { consumeQueue } from "../utils/rabbitmq";

/**
 * Xử lý logic đặt lịch
 */
async function processBooking(message: any) {
  const { userId, expertId, availableId, issues, notes, type } = message;

  const result = await AppointmentRepository.addUsingRabbitMQ({
    userId,
    expertId,
    availableId,
    issues,
    notes,
    type,
  });
}

// Khởi động consumer để lắng nghe hàng đợi
consumeQueue(QUEUE_NAMES.BOOKING_QUEUE, processBooking);
