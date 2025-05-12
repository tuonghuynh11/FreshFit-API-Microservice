import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import {
  ChallengeQueryStatusFilter,
  ChallengeQueryTypeFilter,
  ChallengeStatus,
  UserChallengeParticipationStatus,
  UserRole
} from '~/constants/enums'
import { CHALLENGE_MESSAGES, HEALTH_PLAN_MESSAGES } from '~/constants/messages'
import { ChallengeReqBody, UpdateChallengeReqBody } from '~/models/requests/Challenge.requests'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Challenges from '~/models/schemas/Challenges.schema'
import UserChallengeParticipation from '~/models/schemas/UserChallengeParticipation.schema'

class ChallengesService {
  async search({
    search,
    status,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    type
  }: {
    search?: string
    status: ChallengeQueryStatusFilter
    type: ChallengeQueryTypeFilter
    page?: number
    limit?: number
    sort_by: string
    order_by: string
  }) {
    const conditions: any = {
      // status: ChallengeStatus.Active
    }
    if (search) {
      conditions.name = {
        $regex: search,
        $options: 'i'
      }
    }

    if (type !== ChallengeQueryTypeFilter.All) {
      conditions.type = type
    }
    if (status !== ChallengeQueryStatusFilter.All) {
      conditions.status = status
    }

    const [challenges, total] = await Promise.all([
      databaseService.challenges
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.challenges.countDocuments(conditions)
    ])
    return {
      challenges,
      total
    }
  }

  async getById({ id }: { id: string }) {
    const challenge: any = await databaseService.challenges.findOne({
      _id: new ObjectId(id)
    })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const health_plan = await databaseService.healthPlans
      .aggregate([
        {
          $match: {
            _id: new ObjectId(challenge.health_plan_id)
          }
        },
        {
          $lookup: {
            from: 'health_plan_details',
            localField: 'details',
            foreignField: '_id',
            as: 'details'
          }
        },
        {
          $set: {
            details: {
              $sortArray: {
                input: '$details',
                sortBy: {
                  week: 1, // Sort tăng dần week
                  day: 1 // Sau đó sort tăng dần day
                }
              }
            }
          }
        }
      ])
      .toArray()

    if (!health_plan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return {
      ...challenge,
      health_plan: health_plan[0]
    }
  }

  async add({ challenge, role, userId }: { challenge: ChallengeReqBody; role: UserRole; userId: string }) {
    const newChallenge = new Challenges({
      ...challenge,
      health_plan_id: challenge.health_plan_id ? new ObjectId(challenge.health_plan_id) : undefined
    })
    const challengeInserted = await databaseService.challenges.insertOne(newChallenge)

    const result = await databaseService.challenges.findOne({
      _id: challengeInserted.insertedId
    })
    return result
  }
  async update({ id, updateChallenge }: { id: string; updateChallenge: UpdateChallengeReqBody }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    console.log('updateChallenge', updateChallenge)
    const temp: any = { ...updateChallenge }
    if (updateChallenge.health_plan_id) {
      const healthPlan = await databaseService.healthPlans.findOne({
        _id: new ObjectId(updateChallenge.health_plan_id)
      })
      if (!healthPlan) {
        throw new ErrorWithStatus({
          message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      temp.health_plan_id = new ObjectId(updateChallenge.health_plan_id)
    }
    const result = await databaseService.challenges.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...temp
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return result
  }

  async join({ id, user_id }: { id: string; user_id: string }) {
    const challenge = await databaseService.challenges.findOne({
      _id: new ObjectId(id)
    })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // Check if the challenge is active
    if (challenge.status !== ChallengeStatus.Active) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_ACTIVE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const isJoined = await databaseService.userChallengeParticipation.findOne({
      user_id: new ObjectId(user_id),
      challenge_id: new ObjectId(id)
    })

    if (isJoined) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_IS_JOINED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const userChallengeParticipation = new UserChallengeParticipation({
      user_id: new ObjectId(user_id),
      challenge_id: new ObjectId(id),
      health_plan_id: challenge.health_plan_id!,
      status: UserChallengeParticipationStatus.Pending,
      start_date: challenge.start_date,
      end_date: challenge.end_date
    })
    const userChallengeParticipationInserted =
      await databaseService.userChallengeParticipation.insertOne(userChallengeParticipation)

    return userChallengeParticipationInserted
  }

  async activate({ id }: { id: string }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new Error(CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND)
    }
    // Check if the challenge has a health plan
    if (!challenge.health_plan_id) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_MUST_HAVE_HEALTH_PLAN,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if the health plan exists
    const healthPlan = await databaseService.healthPlans.findOne({
      _id: new ObjectId(challenge.health_plan_id)
    })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if challenge is expired
    const currentDate = new Date()
    if (challenge.start_date < currentDate) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_EXPIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const result = await databaseService.challenges.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ChallengeStatus.Active
        }
      }
    )

    return result
  }
  async deactivate({ id }: { id: string }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new Error(CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND)
    }

    const result = await databaseService.challenges.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ChallengeStatus.Inactive
        }
      }
    )

    return result
  }
  async delete({ id }: { id: string }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new Error(CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND)
    }

    const isUsedByChallenge = await databaseService.userChallengeParticipation
      .find({
        challenge_id: new ObjectId(id),
        status: {
          $in: [UserChallengeParticipationStatus.Ongoing, UserChallengeParticipationStatus.Completed]
        }
      })
      .toArray()

    if (isUsedByChallenge.length > 0) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_IS_USED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const result = await databaseService.challenges.deleteOne({ _id: new ObjectId(id) })

    return result
  }
}
const challengesService = new ChallengesService()
export default challengesService
