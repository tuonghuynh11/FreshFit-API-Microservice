// messaging/queueTypes.ts

export interface CreateExpertPayload {
  name: string
  email: string
  skills: string[]
}

export interface QueuePayloadMap {
  'create-expert': CreateExpertPayload
  // 'another-queue': AnotherPayload;
}
