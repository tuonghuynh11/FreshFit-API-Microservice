import { ChallengeQueryTypeFilter, ChallengeStatus, ChallengeTarget, ChallengeType } from '~/constants/enums'
import { MealReqBody } from './Meal.requests'
import { WorkoutPlanReqBody } from './WorkoutPlan.requests'
import { Filter } from './Index.request'
import { PaginationReqQuery } from './Pagination.requests'

export interface ChallengeReqBody {
  name: string
  description: string
  type: ChallengeType
  prize_image: string
  prize_title: string
  target: ChallengeTarget
  target_image: string
  fat_percent?: number
  weight_loss_target?: number
  image: string
  status: ChallengeStatus
  start_date: Date
  end_date: Date
  meal?: MealReqBody
  workout_plan?: WorkoutPlanReqBody
}
export interface UpdateChallengeReqBody {
  name?: string
  description?: string
  type?: ChallengeType
  prize_image?: string
  prize_title?: string
  target?: ChallengeTarget
  target_image?: string
  fat_percent?: number
  weight_loss_target?: number
  image?: string
  status?: ChallengeStatus
  start_date?: Date
  end_date?: Date
}

export interface ChallengeReqQuery extends PaginationReqQuery, Filter {
  type: ChallengeQueryTypeFilter
}
