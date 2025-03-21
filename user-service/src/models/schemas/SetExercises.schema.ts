import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'

export interface SetExercisesType {
  _id?: ObjectId
  exercise_id: string
  duration: number // seconds
  reps: number
  round: number
  rest_per_round: number // seconds
  estimated_calories_burned: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
}

export default class SetExercises {
  _id?: ObjectId
  exercise_id: ObjectId
  duration: number // seconds
  reps: number
  round: number
  rest_per_round: number // seconds
  estimated_calories_burned: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date

  constructor(setExercises: SetExercisesType) {
    const date = new Date()
    this._id = setExercises._id
    this.exercise_id = new ObjectId(setExercises.exercise_id)
    this.duration = setExercises.duration
    this.reps = setExercises.reps
    this.round = setExercises.round
    this.rest_per_round = setExercises.rest_per_round
    this.estimated_calories_burned = setExercises.estimated_calories_burned
    this.status = setExercises.status || GeneralStatus.Undone
    this.created_at = setExercises.created_at || date
    this.updated_at = setExercises.updated_at || date
  }
}
