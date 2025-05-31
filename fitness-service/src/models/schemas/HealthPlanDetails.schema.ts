import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'

export interface WorkoutHealthPlanDetail {
  _id?: ObjectId
  set: ObjectId
  status?: GeneralStatus
  orderNumber?: number
}
export interface NutritionHealthPlanDetail {
  _id?: ObjectId
  meal: ObjectId
  status?: GeneralStatus
  orderNumber?: number
}
interface HealthPlanDetailType {
  _id?: ObjectId
  workout_details?: WorkoutHealthPlanDetail[]
  nutrition_details?: NutritionHealthPlanDetail[]
  name?: string
  day: number
  week: number
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
}

export default class HealthPlanDetails {
  _id?: ObjectId
  workout_details?: WorkoutHealthPlanDetail[]
  nutrition_details?: NutritionHealthPlanDetail[]
  name?: string
  day: number
  week: number
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date

  constructor(healthPlanDetail: HealthPlanDetailType) {
    const date = new Date()
    this._id = healthPlanDetail._id
    this.day = healthPlanDetail.day
    this.week = healthPlanDetail.week
    this.status = healthPlanDetail.status || GeneralStatus.Undone
    this.created_at = healthPlanDetail.created_at || date
    this.updated_at = healthPlanDetail.updated_at || date
    this.workout_details = healthPlanDetail.workout_details?.map((item) => ({
      _id: item._id || new ObjectId(),
      set: item.set,
      status: item.status || GeneralStatus.Undone,
      orderNumber: item.orderNumber || 0
    }))
    this.nutrition_details = healthPlanDetail.nutrition_details?.map((item) => ({
      _id: item._id || new ObjectId(),
      meal: item.meal,
      status: item.status || GeneralStatus.Undone,
      orderNumber: item.orderNumber || 0
    }))
    this.estimated_calories_burned = healthPlanDetail.estimated_calories_burned || 0
    this.estimated_calories_intake = healthPlanDetail.estimated_calories_intake || 0
    this.name = healthPlanDetail.name || ''
  }
}
