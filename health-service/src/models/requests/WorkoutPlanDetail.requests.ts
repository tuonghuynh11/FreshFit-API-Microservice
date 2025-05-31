import { GeneralQueryStatusFilter, GeneralStatus } from '~/constants/enums'
import { SetReqBody } from './Set.requests'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface WorkoutPlanDetailReqBody {
  sets: SetReqBody[]
  day: number
  week: number
}
export interface UpdateWorkoutPlanDetailReqBody {
  day?: number
  week?: number
  status?: GeneralStatus
}

export interface WorkoutPlanDetailReqQuery extends PaginationReqQuery, Filter {
  status: GeneralQueryStatusFilter
  week?: number
}
