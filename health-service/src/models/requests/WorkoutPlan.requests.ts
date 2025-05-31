import {
  GeneralQueryStatusFilter,
  GeneralStatus,
  RoleTypeQueryFilter,
  WorkoutPlanQueryTypeFilter,
  WorkoutType
} from '~/constants/enums'
import { WorkoutPlanDetailReqBody } from './WorkoutPlanDetail.requests'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface WorkoutPlanReqBody {
  name: string
  description: string
  number_of_set: number
  estimated_calories_burned: number
  type: WorkoutType
  start_date?: Date
  end_date?: Date
  details: WorkoutPlanDetailReqBody[]
}
export interface UpdateWorkoutPlanReqBody {
  name?: string
  description?: string
  number_of_set?: number
  estimated_calories_burned?: number
  type?: WorkoutType
  start_date?: Date
  end_date?: Date
  status?: GeneralStatus
}

export interface WorkoutPlanReqQuery extends PaginationReqQuery, Filter {
  type: WorkoutPlanQueryTypeFilter
  status: GeneralQueryStatusFilter
  source: RoleTypeQueryFilter
}
