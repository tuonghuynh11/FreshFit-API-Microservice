import { UserChallengeParticipationQueryTypeFilter } from '~/constants/enums'
import { Filter } from './Index.request'
import { PaginationReqQuery } from './Pagination.requests'

export interface UserChallengeParticipationReqQuery extends PaginationReqQuery, Filter {
  status: UserChallengeParticipationQueryTypeFilter
}
export interface UpdateProgressEachDayReqBody {
  completed_workouts: {
    workout_detail_id: string
    actual_finish_time: number // thời gian thực tế hoàn thành bài tập
  }[]
  completed_nutritions: string[]
}
export interface GetUserChallengeProgressReqQuery {
  week?: number
  day?: number
}
