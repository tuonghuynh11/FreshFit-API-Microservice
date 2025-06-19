import { RoleTypeQueryFilter, SetStatus, SetType } from '~/constants/enums'
import { SetExerciseReqBody, UpdateSetExerciseReqBody } from './SetExercise.requests'
import { Filter } from './Index.request'
import { PaginationReqQuery } from './Pagination.requests'

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
  set_exercises?: UpdateSetExerciseReqBody[]
  status?: SetStatus
  time?: string // 2 hour, 30 minutes
  image?: string
  total_calories?: number
  is_youtube_workout?: boolean // true nếu là youtube workout, false nếu là set bài tập bình thường
  youtube_id?: string
  rating?: number
}

export interface SetReqQuery extends PaginationReqQuery, Filter {
  type: RoleTypeQueryFilter
  min_calories?: number
  max_calories?: number
  isRecommended?: string
  level?: SetType
}
