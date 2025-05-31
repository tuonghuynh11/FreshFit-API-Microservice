import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface IngredientReqBody {
  name: string
  description: string
  calories: number
  image: string
  cab?: number
  sodium?: number
  sugar?: number
  cholesterol?: number
  fat?: number
  protein?: number
}
export interface UpdateIngredientReqBody {
  name?: string
  description?: string
  calories?: number
  image?: string
  cab?: number
  sodium?: number
  sugar?: number
  cholesterol?: number
  fat?: number
  protein?: number
}

export interface IngredientReqQuery extends PaginationReqQuery, Filter {}
