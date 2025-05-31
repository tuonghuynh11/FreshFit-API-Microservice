import amqp, { Channel, ChannelModel } from 'amqplib'
import { envConfig } from '~/constants/config'

let connection: ChannelModel | null = null
let channel: Channel | null = null

export async function initRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect(envConfig.rabbitMQUrl)
    channel = await connection.createChannel()
    console.log('✅ RabbitMQ connected')
  }
  return channel
}

export function getRabbitChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ channel not initialized')
  return channel
}
