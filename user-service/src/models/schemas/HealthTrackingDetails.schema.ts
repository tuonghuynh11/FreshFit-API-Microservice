import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'

interface IHealthTrackingDetail {
  _id?: ObjectId
  health_tracking_id?: ObjectId
  exerciseId?: string
  dishId?: string
  setId?: string
  mealId?: string
  value: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
}

export default class HealthTrackingDetail {
  _id?: ObjectId
  health_tracking_id?: ObjectId
  exerciseId?: ObjectId
  dishId?: ObjectId
  setId?: ObjectId
  mealId?: ObjectId
  value: number
  status: GeneralStatus
  created_at?: Date
  updated_at?: Date

  constructor(healthTrackingDetail: IHealthTrackingDetail) {
    const date = new Date()
    this._id = healthTrackingDetail._id
    this.health_tracking_id = healthTrackingDetail.health_tracking_id
    this.exerciseId = healthTrackingDetail?.exerciseId ? new ObjectId(healthTrackingDetail.exerciseId) : undefined
    this.dishId = healthTrackingDetail?.dishId ? new ObjectId(healthTrackingDetail.dishId) : undefined
    this.value = healthTrackingDetail.value
    this.setId = healthTrackingDetail?.setId ? new ObjectId(healthTrackingDetail.setId) : undefined
    this.mealId = healthTrackingDetail?.mealId ? new ObjectId(healthTrackingDetail.mealId) : undefined
    this.created_at = healthTrackingDetail.created_at || date
    this.updated_at = healthTrackingDetail.updated_at || date
    this.status = healthTrackingDetail.status || GeneralStatus.Undone
  }
}
