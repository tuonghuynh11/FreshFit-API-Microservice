import {
  ChallengeQueryStatusFilter,
  ChallengeQueryTypeFilter,
  ChallengeStatus,
  ChallengeTarget,
  ChallengeType
} from '~/constants/enums'
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
  health_plan_id?: string
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
  health_plan_id?: string
}

export interface ChallengeReqQuery extends PaginationReqQuery, Filter {
  type: ChallengeQueryTypeFilter
  status: ChallengeQueryStatusFilter
}
export interface ChallengeLeaderBoardReqQuery extends PaginationReqQuery {}
