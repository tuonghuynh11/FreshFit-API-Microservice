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

export interface DishReqQuery extends PaginationReqQuery, Filter {}
