import { GeneralStatus } from '~/constants/enums'

export interface SetExerciseReqBody {
  exercise_id: string
  duration: number
  reps?: number
  timePerRound?: number // seconds , dành cho các bài tập không có rep như plank, jumping jack
  round: number
  rest_per_round: number
  estimated_calories_burned: number
  orderNumber: number // thứ tự bài tập trong set, dùng để sắp xếp thứ tự bài tập trong set
}
export interface UpdateSetExerciseReqBody {
  exercise_id?: string
  duration?: number // seconds
  reps?: number
  timePerRound?: number // seconds , dành cho các bài tập không có rep như plank, jumping jack
  round?: number
  rest_per_round?: number // seconds
  estimated_calories_burned: number
  status?: GeneralStatus
  orderNumber?: number // thứ tự bài tập trong set, dùng để sắp xếp thứ tự bài tập trong set
}
