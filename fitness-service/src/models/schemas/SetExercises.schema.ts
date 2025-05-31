import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'

export interface SetExercisesType {
  _id?: ObjectId
  exercise_id: string
  duration: number // seconds
  reps?: number
  timePerRound?: number // seconds , dành cho các bài tập không có rep như plank, jumping jack
  round: number
  rest_per_round: number // seconds
  estimated_calories_burned: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
  orderNumber?: number // thứ tự bài tập trong set, dùng để sắp xếp thứ tự bài tập trong set
}

export default class SetExercises {
  _id?: ObjectId
  exercise_id: ObjectId
  duration: number // seconds
  reps?: number // số lần thực hiện động tác, dành cho các bài tập có rep như push up, squat, lunge
  timePerRound?: number // seconds , dành cho các bài tập không có rep như plank, jumping jack
  round: number
  rest_per_round: number // seconds
  estimated_calories_burned: number
  status?: GeneralStatus
  created_at?: Date
  updated_at?: Date
  orderNumber?: number // thứ tự bài tập trong set, dùng để sắp xếp thứ tự bài tập trong set

  constructor(setExercises: SetExercisesType) {
    const date = new Date()
    this._id = setExercises._id
    this.exercise_id = new ObjectId(setExercises.exercise_id)
    this.duration = setExercises.duration
    this.reps = setExercises.reps
    this.timePerRound = setExercises.timePerRound
    this.round = setExercises.round
    this.rest_per_round = setExercises.rest_per_round
    this.estimated_calories_burned = setExercises.estimated_calories_burned
    this.status = setExercises.status || GeneralStatus.Undone
    this.created_at = setExercises.created_at || date
    this.updated_at = setExercises.updated_at || date
    this.orderNumber = setExercises.orderNumber || 0
  }
}
