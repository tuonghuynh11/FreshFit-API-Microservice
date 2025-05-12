import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'

export interface UserChallengeParticipationProgressType {
  _id?: ObjectId
  user_challenge_participation_id: ObjectId
  date: Date
  day: number
  week: number
  health_plan_detail_id: ObjectId
  completed_workouts: ObjectId[] // workout_detail_id array
  completed_nutritions: ObjectId[] // nutrition_detail_id array
  status: GeneralStatus // Undone | Done
  created_at?: Date
  updated_at?: Date
}
export default class UserChallengeParticipationProgress {
  _id?: ObjectId
  user_challenge_participation_id: ObjectId
  date: Date
  health_plan_detail_id: ObjectId
  day: number
  week: number
  completed_workouts: ObjectId[] // workout_detail_id array
  completed_nutritions: ObjectId[] // nutrition_detail_id array
  status: GeneralStatus // Undone | Done
  created_at?: Date
  updated_at?: Date

  constructor(userChallengeParticipationProgress: UserChallengeParticipationProgressType) {
    const date = new Date()
    this._id = userChallengeParticipationProgress._id || new ObjectId()
    this.user_challenge_participation_id = userChallengeParticipationProgress.user_challenge_participation_id
    this.health_plan_detail_id = userChallengeParticipationProgress.health_plan_detail_id
    this.completed_workouts = userChallengeParticipationProgress.completed_workouts || []
    this.completed_nutritions = userChallengeParticipationProgress.completed_nutritions || []
    this.status = userChallengeParticipationProgress.status || GeneralStatus.Undone
    this.created_at = userChallengeParticipationProgress.created_at || date
    this.updated_at = userChallengeParticipationProgress.updated_at || date
    this.date = userChallengeParticipationProgress.date || date
    this.day = userChallengeParticipationProgress.day || 0
    this.week = userChallengeParticipationProgress.week || 0
  }
}
