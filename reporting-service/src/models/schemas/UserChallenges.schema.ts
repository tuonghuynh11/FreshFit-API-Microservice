import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'
import Challenges from './Challenges.schema'

interface UserChallengeType {
  _id?: ObjectId
  challenge: Challenges
  status: GeneralStatus
  start_date: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date
}

export default class UserChallenge {
  _id?: ObjectId
  challenge: Challenges
  status: GeneralStatus
  start_date: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date

  constructor(userChallengeType: UserChallengeType) {
    const date = new Date()
    this._id = userChallengeType._id
    this.challenge = userChallengeType.challenge
    this.status = userChallengeType.status || GeneralStatus.Undone
    this.start_date = userChallengeType.start_date
    this.end_date = userChallengeType.end_date || undefined
    this.created_at = userChallengeType.created_at || date
    this.updated_at = userChallengeType.updated_at || date
  }
}
