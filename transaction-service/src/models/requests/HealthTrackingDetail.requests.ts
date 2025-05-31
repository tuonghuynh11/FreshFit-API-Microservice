import { GeneralStatus, HealthTrackingType, MealType } from '~/constants/enums'

export interface HealthTrackingDetailBody {
  type: HealthTrackingType
  exerciseId?: string
  dishId?: string
  setId?: string
  mealId?: string
  date?: string
  value: number
}
export interface UpdateHealthTrackingDetailBody {
  status: GeneralStatus
  actual_finish_time?: number
}

export interface HealthTrackingDetailForMealBody {
  mealType: MealType
  dishIds: string[]
  date?: string
}
export interface DeleteDishesInHealthTrackingDetailForMealBody {
  dishIds: string[]
}
