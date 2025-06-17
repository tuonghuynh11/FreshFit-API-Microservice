import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'
import DishesIngredients from '../schemas/DishesIngredients.schema'

export interface DishReqBody {
  name: string
  description: string
  calories: number
  prep_time: number
  rating: number
  image: string
  instruction: string
  ingredients: DishesIngredients[]
  fat?: number
  saturatedFat?: number
  cholesterol?: number
  sodium?: number
  carbohydrate?: number
  fiber?: number
  sugar?: number
  protein?: number
  source_id?: string
}
export interface UpdateDishReqBody {
  name?: string
  description?: string
  calories?: number
  prep_time?: number
  rating?: number
  image?: string
  instruction?: string
  fat?: number
  saturatedFat?: number
  cholesterol?: number
  sodium?: number
  carbohydrate?: number
  fiber?: number
  sugar?: number
  protein?: number
}

export interface DishIngredientReqBody {
  ingredientId: string
  quantity: string
  unit: string
}
export interface UpdateDishIngredientReqBody {
  ingredientId?: string
  quantity?: string
  unit?: string
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

export interface DishReqQuery extends PaginationReqQuery, Filter {
  min_calories?: number
  max_calories?: number
}

export interface SearchDishByIngredientReqQuery extends PaginationReqQuery {
  ingredients: string
  sort_by: string
  order_by: string
  min_calories?: number
  max_calories?: number
}
