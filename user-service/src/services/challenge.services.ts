import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import {
  ChallengeQueryStatusFilter,
  ChallengeQueryTypeFilter,
  ChallengeStatus,
  GeneralStatus,
  UserChallengeParticipationStatus,
  UserRole
} from '~/constants/enums'
import { CHALLENGE_MESSAGES, HEALTH_PLAN_MESSAGES } from '~/constants/messages'
import { ChallengeReqBody, UpdateChallengeReqBody } from '~/models/requests/Challenge.requests'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Challenges from '~/models/schemas/Challenges.schema'
import UserChallengeParticipation from '~/models/schemas/UserChallengeParticipation.schema'
import { getDayAndWeekIndex } from '~/utils/commons'

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
        $regex: search.trim(),
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
      // databaseService.challenges
      //   .find(conditions, {
      //     skip: page && limit ? (page - 1) * limit : undefined,
      //     limit: limit,
      //     sort: {
      //       [sort_by]: order_by === 'ASC' ? 1 : -1
      //     }
      //   })
      //   .toArray(),
      await databaseService.challenges
        .aggregate([
          {
            $match: conditions
          },
          {
            $sort: {
              [sort_by]: order_by === 'ASC' ? 1 : -1
            }
          },
          ...(page && limit ? [{ $skip: (page - 1) * limit }, { $limit: limit }] : []),
          {
            $lookup: {
              from: 'user_challenge_participation',
              localField: '_id',
              foreignField: 'challenge_id',
              as: 'participations'
            }
          },
          {
            $addFields: {
              total_participation: { $size: '$participations' },
              total_completed_participation: {
                $size: {
                  $filter: {
                    input: '$participations',
                    as: 'p',
                    cond: { $eq: ['$$p.status', UserChallengeParticipationStatus.Completed] } // 👈 thay đúng enum nếu là string/số
                  }
                }
              }
            }
          },
          {
            $project: {
              participations: 0 // ẩn mảng gốc nếu không cần
            }
          }
        ])
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

    if (!challenge?.health_plan_id) {
      return {
        ...challenge,
        total_workouts: 0,
        total_meals: 0,
        health_plan: null
      }
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
    // total workouts
    const totalWorkouts = health_plan[0].details.reduce((acc: number, plan: any) => {
      if (plan.workout_details) {
        return acc + plan.workout_details.length
      }
      return acc
    }, 0)
    // total meals
    const totalMeals = health_plan[0].details.reduce((acc: number, plan: any) => {
      if (plan.nutrition_details) {
        return acc + plan.nutrition_details.length
      }
      return acc
    }, 0)
    return {
      ...challenge,
      total_workouts: totalWorkouts,
      total_meals: totalMeals,
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

    return userChallengeParticipationInserted.insertedId.toString()
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

    if (challenge.status === ChallengeStatus.Active) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CHALLENGE_MESSAGES.CAN_NOT_DELETE_ACTIVE_CHALLENGE
      })
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

  async getLeaderboard({
    id,
    user_id,
    page = 1,
    limit = 10
  }: {
    id: string
    user_id: string
    page?: number
    limit?: number
  }) {
    const challenge = await databaseService.challenges.findOne({
      _id: new ObjectId(id)
    })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!challenge.health_plan_id) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const healthPlan = await databaseService.healthPlans.findOne({
      _id: new ObjectId(challenge.health_plan_id)
    })
    const totalChallengeDays = healthPlan?.details.length
    const basePipeline = [
      {
        $match: {
          challenge_id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'user_challenge_participation_progress',
          localField: '_id',
          foreignField: 'user_challenge_participation_id',
          as: 'progress'
        }
      },
      {
        $addFields: {
          completedDays: {
            $size: {
              $filter: {
                input: '$progress',
                as: 'p',
                cond: {
                  $eq: ['$$p.status', 'Done']
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          user_id: 1,
          challenge_id: 1,
          completedDays: 1,
          'user._id': 1,
          'user.fullName': 1,
          'user.username': 1,
          'user.email': 1,
          'user.avatar': 1
        }
      }
    ]

    // Lấy tổng số bản ghi
    const totalItemsResult = await databaseService.userChallengeParticipation
      .aggregate([...basePipeline, { $count: 'total' }])
      .toArray()

    const totalItems = totalItemsResult[0]?.total || 0

    // Lấy dữ liệu với skip/limit
    const participationProgresses = await databaseService.userChallengeParticipation
      .aggregate([...basePipeline, { $sort: { completedDays: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }])
      .toArray()
    return {
      leaderboard: {
        totalChallengeDays,
        participationProgresses
      },
      total: totalItems
    }
  }
  async getChallengeGeneralStatistic({ id, user_id }: { id: string; user_id: string }) {
    const challenge = await databaseService.challenges.findOne({
      _id: new ObjectId(id)
    })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!challenge.health_plan_id) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const healthPlan = await databaseService.healthPlans.findOne({
      _id: new ObjectId(challenge.health_plan_id)
    })
    const { dayOfWeek: nowDay, weekIndex: nowWeek } = getDayAndWeekIndex(
      new Date(challenge.start_date),
      new Date(challenge.end_date),
      new Date()
    )
    let totalParticipationCompletedToday = 0
    let isTodayUserCompleted = false
    const currentHealthPlanDetail = await databaseService.healthPlanDetails.findOne({
      _id: {
        $in: healthPlan?.details
      },
      day: nowDay,
      week: nowWeek
    })

    const totalChallengeDays = healthPlan?.details.length
    const totalParticipation = await databaseService.userChallengeParticipation
      .find({
        challenge_id: new ObjectId(id)
      })
      .toArray()

    if (!currentHealthPlanDetail) {
      totalParticipationCompletedToday = totalParticipation.length
      isTodayUserCompleted = true
    } else {
      const [participationProgresses, todayUserProgresses] = await Promise.all([
        databaseService.userChallengeParticipation
          .aggregate([
            {
              $match: {
                challenge_id: new ObjectId(id)
              }
            },
            {
              $lookup: {
                from: 'user_challenge_participation_progress',
                localField: '_id',
                foreignField: 'user_challenge_participation_id',
                as: 'progress'
              }
            },
            {
              $match:
                /**
                 * query: The query in MQL.
                 */
                {
                  'progress.health_plan_detail_id': currentHealthPlanDetail._id,
                  'progress.status': GeneralStatus.Done
                }
            }
          ])
          .toArray(),
        databaseService.userChallengeParticipation
          .aggregate([
            {
              $match: {
                challenge_id: new ObjectId(id),
                user_id: new ObjectId(user_id)
              }
            },
            {
              $lookup: {
                from: 'user_challenge_participation_progress',
                localField: '_id',
                foreignField: 'user_challenge_participation_id',
                as: 'progress'
              }
            },
            {
              $match:
                /**
                 * query: The query in MQL.
                 */
                {
                  'progress.health_plan_detail_id': currentHealthPlanDetail._id,
                  'progress.status': GeneralStatus.Done
                }
            }
          ])
          .toArray()
      ])
      totalParticipationCompletedToday = participationProgresses.length
      isTodayUserCompleted = todayUserProgresses.length !== 0 ? true : false
    }

    const userProgresses = await databaseService.userChallengeParticipation
      .aggregate([
        {
          $match: {
            challenge_id: new ObjectId(id),
            user_id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'user_challenge_participation_progress',
            localField: '_id',
            foreignField: 'user_challenge_participation_id',
            as: 'progress'
          }
        },
        {
          $addFields: {
            completedDays: {
              $size: {
                $filter: {
                  input: '$progress',
                  as: 'p',
                  cond: {
                    $eq: ['$$p.status', 'Done']
                  }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            user_id: 1,
            challenge_id: 1,
            completedDays: 1,
            'user._id': 1,
            'user.fullName': 1,
            'user.username': 1,
            'user.email': 1,
            'user.avatar': 1
          }
        }
      ])
      .toArray()

    return {
      totalParticipation: totalParticipation.length,
      totalParticipationCompletedToday,
      totalParticipationUnCompletedToday: totalParticipation.length - totalParticipationCompletedToday,
      isTodayUserCompleted,
      totalChallengeDays,
      userProgresses: userProgresses.length > 0 ? userProgresses[0] : null
    }
  }
}
const challengesService = new ChallengesService()
export default challengesService
