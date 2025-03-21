import { ObjectId } from 'mongodb'
import Exercises from './Exercises.schema'
import Dishes from './Dishes.schema'

interface IHealthTrackingDetail {
  _id?: ObjectId
  health_tracking_id?: ObjectId
  exercise?: Exercises
  dish?: Dishes
  value: number
  created_at?: Date
  updated_at?: Date
}

export default class HealthTrackingDetail {
  _id?: ObjectId
  health_tracking_id?: ObjectId
  exercise?: Exercises
  dish?: Dishes
  value: number
  created_at?: Date
  updated_at?: Date

  constructor(healthTrackingDetail: IHealthTrackingDetail) {
    const date = new Date()
    this._id = healthTrackingDetail._id
    this.health_tracking_id = healthTrackingDetail.health_tracking_id
    this.exercise = healthTrackingDetail.exercise
    this.dish = healthTrackingDetail.dish
    this.value = healthTrackingDetail.value
    this.created_at = healthTrackingDetail.created_at || date
    this.updated_at = healthTrackingDetail.updated_at || date
  }
}
