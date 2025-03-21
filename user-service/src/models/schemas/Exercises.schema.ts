import { ObjectId } from 'mongodb'
import { ExerciseCategories } from '~/constants/enums'

interface ExercisesType {
  _id?: ObjectId
  name: string
  description: string
  category: ExerciseCategories
  calories_burn_per_minutes: number
  rating?: number
  image: string
  video: string
  created_at?: Date
  updated_at?: Date
}

export default class Exercises {
  _id?: ObjectId
  name: string
  description: string
  category: ExerciseCategories
  calories_burn_per_minutes: number
  rating?: number
  image: string
  video: string
  created_at?: Date
  updated_at?: Date

  constructor(exercise: ExercisesType) {
    const date = new Date()
    this._id = exercise._id
    this.name = exercise.name
    this.description = exercise.description
    this.category = exercise.category
    this.calories_burn_per_minutes = exercise.calories_burn_per_minutes
    this.image = exercise.image
    this.video = exercise.video
    this.created_at = exercise.created_at || date
    this.updated_at = exercise.updated_at || date
    this.rating = exercise.rating || 0
  }
}
