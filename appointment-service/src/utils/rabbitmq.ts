import amqp, { Channel, ChannelModel } from "amqplib";
import Logger from "./logger";
import { QUEUE_NAMES } from "../common/constants/rabbitMq.values";
import configuration from "../configuration";

const RABBITMQ_URL = configuration.rabbitMQHost; // Thay bằng URL của RabbitMQ trên server

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

/**
 * Kết nối đến RabbitMQ (chỉ khởi tạo một lần duy nhất).
 */
export async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection?.createChannel();
    Logger.info("✅ Connected to RabbitMQ");
  }
  return { connection, channel };
}

/**
 * Khởi tạo hàng đợi (có thể dùng cho nhiều queue khác nhau).
 * @param queueName - Tên hàng đợi cần tạo
 */
export async function initializeQueue(queueName: string) {
  const { channel } = await connectRabbitMQ();
  if (!channel) throw new Error("RabbitMQ channel is not available");

  await channel.assertQueue(queueName, { durable: true });
  Logger.info(`📥 Queue initialized: ${queueName}`);
}

/**
 * Gửi message vào hàng đợi.
 * @param queueName - Tên hàng đợi
 * @param message - Dữ liệu cần gửi
 */
export async function publishToQueue(queueName: string, message: any) {
  const { channel } = await connectRabbitMQ();
  if (!channel) throw new Error("RabbitMQ channel is not available");

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  Logger.info(`📩 Sent message to ${queueName}:`, message);
}

/**
 * Lắng nghe và xử lý message từ hàng đợi.
 * @param queueName - Tên hàng đợi
 * @param callback - Hàm xử lý message
 */
export async function consumeQueue(
  queueName: string,
  callback: (msg: any) => Promise<void>
) {
  const { channel } = await connectRabbitMQ();
  if (!channel) throw new Error("RabbitMQ channel is not available");

  await initializeQueue(queueName); // Đảm bảo hàng đợi tồn tại

  channel.consume(queueName, async (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      await callback(content);
      channel.ack(msg); // Xác nhận đã xử lý message
    }
  });

  Logger.info(`🔄 Consumer is listening on ${queueName}...`);
}

export async function initMyRabbitMQ() {
  await connectRabbitMQ(); // Kết nối đến RabbitMQ
  await Promise.all([initializeQueue(QUEUE_NAMES.BOOKING_QUEUE)]); // Khởi tạo hàng đợi
  // Logger.info("✅ RabbitMQ initialized");
}
