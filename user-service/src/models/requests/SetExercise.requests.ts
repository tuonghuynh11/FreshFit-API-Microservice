import { GeneralStatus } from '~/constants/enums'

export interface SetExerciseReqBody {
  exercise_id: string
  duration: number
  reps: number
  round: number
  rest_per_round: number
  estimated_calories_burned: number
}
export interface UpdateSetExerciseReqBody {
  exercise_id?: string
  duration?: number // seconds
  reps?: number
  round?: number
  rest_per_round?: number // seconds
  estimated_calories_burned: number
  status?: GeneralStatus
}
