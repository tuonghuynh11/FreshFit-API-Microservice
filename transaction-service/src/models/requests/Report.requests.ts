import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface ReportReqBody {
  title: string
  message: string
  image?: string
}
export interface UpdateDishReqBody {
  name?: string
  description?: string
  calories?: number
  prep_time?: number
  rating?: number
  image?: string
  instruction?: string
}

export interface DishIngredientReqBody {
  ingredientId: string
  quantity: number
  unit: string
}
export interface UpdateDishIngredientReqBody {
  ingredientId?: string
  quantity?: number
  unit?: number
}

export interface UpdateDishReqBody {
  name?: string
  description?: string
  calories?: number
  prep_time?: number
  rating?: number
  image?: string
  instruction?: string
}

export interface ReportReqQuery extends PaginationReqQuery, Filter {}
