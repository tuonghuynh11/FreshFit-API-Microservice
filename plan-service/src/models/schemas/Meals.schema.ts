import { ObjectId } from 'mongodb'
import { GeneralStatus, MealType } from '~/constants/enums'

interface IMeals {
  _id?: ObjectId
  name?: string
  user_id?: ObjectId
  description: string
  calories: number
  pre_time: number // seconds
  meal_type: MealType
  date: string
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
  dishes: string[]
  isPartOfHealthTrackingDetail?: boolean
}

export default class Meals {
  _id?: ObjectId
  name?: string
  user_id?: ObjectId
  description: string
  calories: number
  pre_time: number // seconds
  meal_type: MealType
  date: Date
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
  dishes: ObjectId[]
  isPartOfHealthTrackingDetail?: boolean

  constructor(meal: IMeals) {
    const date = new Date()
    this._id = meal._id
    this.name = meal.name
    this.user_id = meal.user_id
    this.description = meal.description
    this.calories = meal.calories
    this.pre_time = meal.pre_time
    this.meal_type = meal.meal_type
    this.date = new Date(meal.date)
    this.status = meal.status || GeneralStatus.Undone
    this.created_at = meal.created_at || date
    this.updated_at = meal.updated_at || date
    this.dishes = meal?.dishes?.map((item) => new ObjectId(item)) || []
    this.isPartOfHealthTrackingDetail = meal.isPartOfHealthTrackingDetail || false
  }
}
