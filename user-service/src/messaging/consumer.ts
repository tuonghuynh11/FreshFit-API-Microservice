import { ConsumeMessage } from 'amqplib'
import { getRabbitChannel } from './connection'
import { assertQueues } from './messaging'
import { QueuePayloadMap } from './queueTypes'

const MAX_RETRY_COUNT = 3

export async function consumeMessages<K extends keyof QueuePayloadMap>(
  queue: K,
  callback: (data: QueuePayloadMap[K]) => Promise<void>
): Promise<void> {
  const channel = getRabbitChannel()
  await assertQueues(channel, queue) // tạo queue và các DLQ liên quan
  channel.prefetch(1)

  channel.consume(queue, async (msg) => {
    if (!msg) return

    try {
      const data = JSON.parse(msg.content.toString()) as QueuePayloadMap[K]
      await callback(data)
      channel.ack(msg)
    } catch (error) {
      const retryCount = getRetryCount(msg) + 1

      if (retryCount >= MAX_RETRY_COUNT) {
        console.warn(`❌ Retry exceeded for ${queue}, moving to DLQ`)
        // Send to DLQ
        channel.sendToQueue(`${queue}-dlq`, msg.content, {
          persistent: true
        })
        channel.ack(msg) // tránh lặp vô hạn
      } else {
        console.warn(`🔁 Retry ${retryCount} for ${queue}`)
        // Requeue to retry-queue
        const updatedHeaders = {
          ...msg.properties.headers,
          'x-retry-count': retryCount
        }
        channel.sendToQueue(`${queue}-retry`, msg.content, {
          persistent: true,
          headers: updatedHeaders
        })
        channel.ack(msg) // ack để tránh requeue mặc định
      }
    }
  })
}

function getRetryCount(msg: ConsumeMessage): number {
  return msg.properties.headers?.['x-retry-count'] || 0
}
