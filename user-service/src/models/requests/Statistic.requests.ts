export interface TopStatisticReqQuery {
  top?: number
}
export interface UserGrowthReqQuery {
  year: number
}
export interface TopChallengesReqQuery {
  year: number
  top?: number
}

export interface WorkoutWeeklyCompletionRateReqQuery {
  year: number
  month: number
  week: number
}
