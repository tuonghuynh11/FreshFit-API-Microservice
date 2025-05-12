import {
  GeneralQueryStatusFilter,
  GeneralStatus,
  RoleTypeQueryFilter,
  WorkoutPlanQueryTypeFilter,
  WorkoutType
} from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface HealthPlanReqBody {
  user_id?: string
  name: string
  description: string
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
  level: WorkoutType
  start_date?: Date
  end_date?: Date
}
export interface UpdateHealthPlanReqBody {
  name?: string
  description?: string
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
  level?: WorkoutType
  start_date?: Date
  end_date?: Date
}

export interface HealthPlanReqQuery extends PaginationReqQuery, Filter {
  level: WorkoutPlanQueryTypeFilter
  status: GeneralQueryStatusFilter
  source: RoleTypeQueryFilter
}
