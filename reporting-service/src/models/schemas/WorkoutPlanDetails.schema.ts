import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'

interface WorkoutPlanDetailType {
  _id?: ObjectId
  sets: ObjectId[]
  day: number
  week: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
}

export default class WorkoutPlanDetails {
  _id?: ObjectId
  sets: ObjectId[]
  day: number
  week: number
  status: GeneralStatus
  created_at?: Date
  updated_at?: Date

  constructor(workoutPlanDetail: WorkoutPlanDetailType) {
    const date = new Date()
    this._id = workoutPlanDetail._id
    this.sets = workoutPlanDetail.sets
    this.day = workoutPlanDetail.day
    this.week = workoutPlanDetail.week
    this.status = workoutPlanDetail.status || GeneralStatus.Undone
    this.created_at = workoutPlanDetail.created_at || date
    this.updated_at = workoutPlanDetail.updated_at || date
  }
}
