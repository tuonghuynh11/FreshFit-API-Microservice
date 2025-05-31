import { Channel } from 'amqplib'

export async function assertQueues(channel: Channel, queueName: string) {
  const retryQueue = `${queueName}-retry` // Queue dùng để retry trước khi đưa về queue chính
  const dlqQueue = `${queueName}-dlq` // (Dead Letter Queue) Queue dùng để lưu các message không thành công sau nhiều lần retry

  // DLQ (Dead Letter Queue)
  await channel.assertQueue(dlqQueue, { durable: true })

  // Retry Queue (delay trước khi đưa về queue chính)
  await channel.assertQueue(retryQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '', // default exchange
      'x-dead-letter-routing-key': queueName,
      'x-message-ttl': 10000 // 10s delay before retry
    }
  })

  // Main queue
  await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '', // default exchange
      'x-dead-letter-routing-key': retryQueue
    }
  })
}
