import { ObjectId } from 'mongodb'

interface WaterType {
  date: string
  goal: number
  step: number
  progress: number
  created_at?: Date
  updated_at?: Date
  user_id?: ObjectId
}

export class Water {
  date: string
  goal: number
  step: number
  progress: number
  created_at?: Date
  updated_at?: Date
  user_id?: ObjectId

  constructor(waterType: WaterType) {
    const date = new Date()
    this.date = waterType.date
    this.goal = waterType.goal
    this.step = waterType.step
    this.progress = waterType.progress
    this.created_at = waterType.created_at || date
    this.updated_at = waterType.updated_at || date
    this.user_id = waterType.user_id
  }
}
