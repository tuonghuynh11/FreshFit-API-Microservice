import { ObjectId } from 'mongodb'
import { UserChallengeParticipationStatus } from '~/constants/enums'

interface UserChallengeParticipationType {
  _id?: ObjectId
  user_id: ObjectId
  challenge_id: ObjectId
  health_plan_id: ObjectId // Copy của hệ thống Health Plan (nếu cần riêng cho user)
  status: UserChallengeParticipationStatus
  // progress: ObjectId[]
  start_date: Date
  end_date: Date
  created_at?: Date
  updated_at?: Date
}

export default class UserChallengeParticipation {
  _id?: ObjectId
  user_id: ObjectId
  challenge_id: ObjectId
  health_plan_id: ObjectId // Copy của hệ thống Health Plan (nếu cần riêng cho user)
  status: UserChallengeParticipationStatus
  // progress: UserChallengeParticipationProgress[]
  start_date: Date
  end_date: Date
  created_at?: Date
  updated_at?: Date
  constructor(userChallengeParticipation: UserChallengeParticipationType) {
    const date = new Date()
    this._id = userChallengeParticipation._id
    this.user_id = userChallengeParticipation.user_id
    this.challenge_id = userChallengeParticipation.challenge_id
    this.health_plan_id = userChallengeParticipation.health_plan_id
    this.status = userChallengeParticipation.status || UserChallengeParticipationStatus.Ongoing
    // this.progress = userChallengeParticipation.progress || []
    this.start_date = userChallengeParticipation.start_date || date
    this.end_date = userChallengeParticipation.end_date || date
    this.created_at = userChallengeParticipation.created_at || date
    this.updated_at = userChallengeParticipation.updated_at || date
  }
}
