// messaging/queueTypes.ts

export interface CreateExpertPayload {
  name: string
  email: string
  skills: string[]
}

export interface AddIngredientPayload {
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

export interface UpdateIngredientPayload extends AddIngredientPayload {
  id: string
}

export interface DeleteIngredientPayload {
  id: string
}

export interface GetIngredientByIdPayload {
  id: string
}

export interface SearchIngredientPayload {
  search?: string
  page?: number
  limit?: number
  order_by?: string
  sort_by?: string
}

export interface SearchIngredientExternalPayload extends SearchIngredientPayload {}

export interface AddMealPayload {
  name: string
  date: string // ISO date string
  description: string
  calories: number
  pre_time: number
  type: string // MealType
  dishes: string[]
}

export interface UpdateMealPayload extends AddMealPayload {
  meal_id: string
}

export interface DeleteMealPayload {
  meal_id: string
}

export interface GetMealByIdPayload {
  meal_id: string
}

export interface GetMealsByDatePayload {
  date: string // ISO date string
}

export interface SearchMealPayload {
  search?: string
  page?: number
  limit?: number
  type?: string
  meal_type?: string
  order_by?: string
  sort_by?: string
  min_calories?: number
  max_calories?: number
}

export interface CloneMealPayload {
  meal_id: string
}

export interface AddDishPayload {
  name: string
  description: string
  calories: number
  prep_time: number
  rating: number
  image: string
  instruction: string
  ingredients: any[] // DishesIngredients[]
  fat?: number
  saturatedFat?: number
  cholesterol?: number
  sodium?: number
  carbohydrate?: number
  fiber?: number
  sugar?: number
  protein?: number
}

export interface UpdateDishPayload extends AddDishPayload {
  id: string
}

export interface DeleteDishPayload {
  id: string
}

export interface GetDishByIdPayload {
  id: string
}

export interface SearchDishPayload {
  search?: string
  page?: number
  limit?: number
  order_by?: string
  sort_by?: string
  min_calories?: number
  max_calories?: number
}

export interface AddDishIngredientPayload {
  dishId: string
  ingredientId: string
  quantity: number
  unit: number
}

export interface UpdateDishIngredientPayload {
  dishId: string
  ingredientId: string
  quantity: number
  unit: number
}

export interface DeleteDishIngredientPayload {
  dishId: string
  ingredientId: string
}

export interface GetDishIngredientDetailPayload {
  dishId: string
  ingredientId: string
}

export interface RateDishPayload {
  id: string
  rating: number
}

export interface QueuePayloadMap {
  'create-expert': CreateExpertPayload
  'add-ingredient': AddIngredientPayload
  'update-ingredient': UpdateIngredientPayload
  'delete-ingredient': DeleteIngredientPayload
  'get-ingredient-by-id': GetIngredientByIdPayload
  'search-ingredient': SearchIngredientPayload
  'search-ingredient-external': SearchIngredientExternalPayload
  'add-meal': AddMealPayload
  'update-meal': UpdateMealPayload
  'delete-meal': DeleteMealPayload
  'get-meal-by-id': GetMealByIdPayload
  'get-meals-by-date': GetMealsByDatePayload
  'search-meal': SearchMealPayload
  'clone-meal': CloneMealPayload
  'add-dish': AddDishPayload
  'update-dish': UpdateDishPayload
  'delete-dish': DeleteDishPayload
  'get-dish-by-id': GetDishByIdPayload
  'search-dish': SearchDishPayload
  'add-dish-ingredient': AddDishIngredientPayload
  'update-dish-ingredient': UpdateDishIngredientPayload
  'delete-dish-ingredient': DeleteDishIngredientPayload
  'get-dish-ingredient-detail': GetDishIngredientDetailPayload
  'rate-dish': RateDishPayload
}
