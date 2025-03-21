import { ObjectId } from 'mongodb'
import { GeneralStatus, WorkoutType } from '~/constants/enums'
import WorkoutPlanDetail from './WorkoutPlanDetails.schema'

interface WorkoutPlanType {
  _id?: ObjectId
  user_id?: ObjectId
  name: string
  description: string
  number_of_set: number
  estimated_calories_burned: number
  status?: GeneralStatus
  type: WorkoutType
  start_date?: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date
  details: WorkoutPlanDetail[]
}

export default class WorkoutPlans {
  _id?: ObjectId
  user_id?: ObjectId
  name: string
  description: string
  number_of_set: number
  estimated_calories_burned: number
  status?: GeneralStatus
  type: WorkoutType
  start_date?: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date
  details: WorkoutPlanDetail[]

  constructor(workoutPlan: WorkoutPlanType) {
    const date = new Date()
    this._id = workoutPlan._id
    this.user_id = workoutPlan.user_id
    this.name = workoutPlan.name
    this.description = workoutPlan.description
    this.status = workoutPlan.status || GeneralStatus.Undone
    this.type = workoutPlan.type
    this.start_date = workoutPlan.start_date
    this.end_date = workoutPlan.end_date
    this.created_at = workoutPlan.created_at || date
    this.updated_at = workoutPlan.updated_at || date
    this.details = workoutPlan.details
    this.number_of_set = workoutPlan.number_of_set
    this.estimated_calories_burned = workoutPlan.estimated_calories_burned
  }
}
