import { GeneralStatus, HealthTrackingType, MealType } from '~/constants/enums'

export interface HealthTrackingDetailBody {
  type: HealthTrackingType
  exerciseId?: string
  dishId?: string
  setId?: string
  mealId?: string
  value: number
}
export interface UpdateHealthTrackingDetailBody {
  status: GeneralStatus
}

export interface HealthTrackingDetailForMealBody {
  mealType: MealType
  dishIds: string[]
}
export interface DeleteDishesInHealthTrackingDetailForMealBody {
  dishIds: string[]
}
