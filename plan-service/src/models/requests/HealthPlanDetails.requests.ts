import { GeneralStatus } from '~/constants/enums'

export interface HealthPlanDetailReqBody {
  name?: string
  day: number
  week: number
  workout_details?: {
    set: string
  }[]
  nutrition_details?: {
    meal: string
  }[]
  estimated_calories_burned?: number
  estimated_calories_intake?: number
}

export interface UpdateHealthPlanDetailReqBody {
  name?: string
  day?: number
  week?: number
  estimated_calories_burned?: number
  estimated_calories_intake?: number
  status?: GeneralStatus
}
export interface AddSetForWorkoutDetailsReqBody {
  sets: {
    id: string
    orderNumber: number
  }[]
}

export interface UpdateOrderNumberInWorkoutDetailsReqBody {
  workout_details: {
    id: string
    orderNumber: number
  }[]
}
export interface DeleteSetForWorkoutDetailsReqBody {
  ids: string[]
}

export interface UpdateWorkoutDetailsStatusReqBody {
  ids: string[]
  status: GeneralStatus
}

export interface AddMealForNutritionDetailsReqBody {
  meals: {
    id: string
    orderNumber: number
  }[]
}
export interface UpdateOrderNumberInNutritionDetailsReqBody {
  nutrition_details: {
    id: string
    orderNumber: number
  }[]
}

export interface UpdateItemStatusInNutritionDetailsReqBody {
  ids: string[]
  status: GeneralStatus
}

export interface DeleteMealForNutritionDetailsReqBody {
  ids: string[]
}
