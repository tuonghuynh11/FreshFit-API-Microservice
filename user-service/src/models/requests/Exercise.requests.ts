import { ExerciseCategories, ExerciseQueryTypeFilter } from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface ExerciseReqBody {
  name: string
  description: string
  category: ExerciseCategories
  calories_burn_per_minutes: number
  image: string
  video: string
}
export interface UpdateExerciseReqBody {
  name?: string
  description?: string
  category?: ExerciseCategories
  calories_burn_per_minutes?: number
  image?: string
  video?: string
}

export interface ExerciseReqQuery extends PaginationReqQuery, Filter {
  type: ExerciseQueryTypeFilter
}
