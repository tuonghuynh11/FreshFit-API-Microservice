// messaging/publisher.ts

import { getRabbitChannel } from './connection'
import { QueuePayloadMap } from './queueTypes'

export async function publishMessage<K extends keyof QueuePayloadMap>(
  queue: K,
  message: QueuePayloadMap[K]
): Promise<void> {
  const channel = getRabbitChannel()
  await channel.assertQueue(queue, { durable: true })

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true
  })
}
