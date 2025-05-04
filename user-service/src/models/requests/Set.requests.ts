import { SetStatus, SetType } from '~/constants/enums'
import { SetExerciseReqBody, UpdateSetExerciseReqBody } from './SetExercise.requests'

export interface SetReqBody {
  name: string
  type: SetType
  description?: string
  number_of_exercises: number
  set_exercises: SetExerciseReqBody[]
}
export interface UpdateSetReqBody {
  name?: string
  type?: SetType
  description?: string
  number_of_exercises?: number
  status?: SetStatus
  rating?: number
  set_exercises?: UpdateSetExerciseReqBody[]
}
