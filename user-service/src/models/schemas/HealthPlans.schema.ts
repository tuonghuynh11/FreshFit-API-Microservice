import { ObjectId } from 'mongodb'
import { GeneralStatus, WorkoutType } from '~/constants/enums'

interface HealthPlanType {
  _id?: ObjectId
  user_id?: ObjectId
  name: string
  description: string
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
  level: WorkoutType
  number_of_weeks: number
  start_date?: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date
  details: string[] // HealthPlanDetails id
}

export default class HealthPlans {
  _id?: ObjectId
  user_id?: ObjectId
  name: string
  description: string
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
  level: WorkoutType
  number_of_weeks: number
  start_date?: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date
  details: ObjectId[] // HealthPlanDetails id

  constructor(healthPlan: HealthPlanType) {
    const date = new Date()
    this._id = healthPlan._id
    this.user_id = healthPlan.user_id
    this.name = healthPlan.name
    this.description = healthPlan.description
    this.status = healthPlan.status || GeneralStatus.Undone
    this.level = healthPlan.level
    this.start_date = healthPlan.start_date
    this.end_date = healthPlan.end_date
    this.created_at = healthPlan.created_at || date
    this.updated_at = healthPlan.updated_at || date
    this.estimated_calories_burned = healthPlan.estimated_calories_burned || 0
    this.estimated_calories_intake = healthPlan.estimated_calories_intake || 0
    this.details = healthPlan.details?.map((item) => new ObjectId(item)) || []
    this.number_of_weeks = healthPlan.number_of_weeks
  }
}
