// import { createExpertFromQueue } from '../services/expertService'

export const setupMessageHandlers = async () => {
  // await consumeMessages('create-expert', createExpertFromQueue)
  // ❗ Add more consumers here as needed
  // await consumeMessages('another-queue', anotherHandler);
  // await consumeMessages('create-expert', async ({ email, name, skills }) => {
  //   console.log(`📩 Received message on create-expert queue: ${name}, ${email}, ${skills.join(', ')}`)
  // })

  await Promise.all([
    // consumeMessages('create-expert', async ({ email, name, skills }) => {
    //   console.log(`📩 Received message on create-expert queue: ${name}, ${email}, ${skills.join(', ')}`)
    // })
  ])
  console.log('✅ Message handlers setup complete')
}
