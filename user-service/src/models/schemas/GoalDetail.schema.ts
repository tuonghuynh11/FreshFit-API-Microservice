import { GoalDetailStatus } from '~/constants/enums'

interface GoalDetailType {
  startDate?: Date
  targetDate?: Date
  days?: number
  goal: number
  progress: number
  status: GoalDetailStatus
  created_at?: Date
  updated_at?: Date
}
export class GoalDetail {
  startDate?: Date
  targetDate?: Date
  days?: number
  goal: number // Kcal
  progress: number
  status: GoalDetailStatus
  created_at?: Date
  updated_at?: Date

  constructor(goalDetail: GoalDetailType) {
    const date = new Date()
    this.startDate = goalDetail.startDate
    this.targetDate = goalDetail.targetDate
    this.goal = goalDetail.goal
    this.progress = goalDetail.progress
    this.created_at = goalDetail.created_at || date
    this.updated_at = goalDetail.updated_at || date
    this.status = goalDetail.status || GoalDetailStatus.UnStart
    this.days = goalDetail.days || 0
  }
}
