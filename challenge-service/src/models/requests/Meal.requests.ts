import { MealQueryType, MealType, RoleTypeQueryFilter } from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface MealReqBody {
  name: string
  date: string
  description: string
  calories: number
  pre_time: number
  meal_type: MealType
  dishes: string[]
}
export interface MealReqQuery extends PaginationReqQuery, Filter {
  type: RoleTypeQueryFilter
  meal_type: MealQueryType
  min_calories?: number
  max_calories?: number
}
