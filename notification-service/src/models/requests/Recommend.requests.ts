import { ActivityLevelRecommend, Gender, MealTypeRecommend, Season } from '~/constants/enums'

export interface DishRecommendReqBody {
  number_of_dishes: number
  number_of_candidates: number
  current_weight: number
  desired_weight: number
  height: number
  age: number
  gender: Gender
  activity_level: ActivityLevelRecommend
}
export interface DishRecommendReqQuery {
  season: Season
  meal_type: MealTypeRecommend
  quick_recipe: boolean
}

export interface WorkoutPlanRecommendReqBody {
  height: number
  weight: number
  age: number
  image: string
  diseases_info: string
  num_of_exercises: number
  gender: Gender
}
