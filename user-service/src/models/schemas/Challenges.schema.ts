import { ObjectId } from 'mongodb'
import { ChallengeStatus, ChallengeTarget, ChallengeType } from '~/constants/enums'
import Meals from './Meals.schema'
import WorkoutPlans from './WorkoutPlans.schema'

interface IChallenges {
  _id?: ObjectId
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
  created_at?: Date
  updated_at?: Date
  meal?: Meals
  workout_plan?: WorkoutPlans
}

export default class Challenges {
  _id?: ObjectId
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
  created_at?: Date
  updated_at?: Date
  meal?: Meals
  workout_plan?: WorkoutPlans

  constructor(challenge: IChallenges) {
    const date = new Date()
    this._id = challenge._id
    this.name = challenge.name
    this.description = challenge.description
    this.type = challenge.type
    this.prize_image = challenge.prize_image
    this.prize_title = challenge.prize_title
    this.target = challenge.target
    this.target_image = challenge.target_image
    this.fat_percent = challenge.fat_percent || undefined
    this.weight_loss_target = challenge.weight_loss_target || undefined
    this.image = challenge.image
    this.status = challenge.status || ChallengeStatus.Inactive
    this.start_date = challenge.start_date
    this.end_date = challenge.end_date
    this.created_at = challenge.created_at || date
    this.updated_at = challenge.updated_at || date
    this.meal = challenge.meal
    this.workout_plan = challenge.workout_plan
  }
}
