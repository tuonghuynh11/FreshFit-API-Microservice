import { ClientSession, Filter, ObjectId } from 'mongodb'
import databaseService from './database.services'
import {
  GeneralStatus,
  UserChallengeParticipationQueryTypeFilter,
  UserChallengeParticipationStatus,
  UserRole
} from '~/constants/enums'
import {
  HEALTH_PLAN_DETAILS_MESSAGES,
  HEALTH_PLAN_MESSAGES,
  USER_CHALLENGE_PARTICIPATION_MESSAGES
} from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { HealthPlanReqBody } from '~/models/requests/HealthPlans.requests'
import HealthPlans from '~/models/schemas/HealthPlans.schema'
import UserChallengeParticipationProgress from '~/models/schemas/UserChallengeParticipationProgress.schema'
import HealthPlanDetails from '~/models/schemas/HealthPlanDetails.schema'

class UserChallengeParticipationService {
  async search({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    status,
    user_id,
    role
  }: {
    search?: string
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    status: UserChallengeParticipationQueryTypeFilter
    user_id: string
    role: UserRole
  }) {
    const matchConditions: any = {
      user_id: new ObjectId(user_id)
    }

    if (status !== UserChallengeParticipationQueryTypeFilter.All) {
      matchConditions.status = status
    }

    const pipeline: any[] = [
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'challenges',
          localField: 'challenge_id',
          foreignField: '_id',
          as: 'challenge'
        }
      },
      {
        $unwind: '$challenge'
      }
    ]

    if (search) {
      pipeline.push({
        $match: {
          'challenge.name': {
            $regex: search,
            $options: 'i'
          }
        }
      })
    }

    // Map sort_by thành đúng trường
    let sortField = ''
    if (sort_by === 'name') {
      sortField = 'challenge.name'
    } else if (['created_at', 'start_date', 'end_date'].includes(sort_by)) {
      sortField = sort_by
    } else {
      sortField = 'created_at' // default
    }

    // Pipeline cho total
    const totalPipeline = [
      ...pipeline,
      {
        $count: 'total'
      }
    ]

    pipeline.push(
      {
        $sort: {
          [sortField]: order_by === 'ASC' ? 1 : -1
        }
      },
      ...(page && limit
        ? [
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            }
          ]
        : []),
      {
        $project: {
          _id: 1,
          user_id: 1,
          challenge_id: 1,
          health_plan_id: 1,
          status: 1,
          start_date: 1,
          end_date: 1,
          created_at: 1,
          updated_at: 1,
          challenge: 1
        }
      }
    )

    const [user_challenges, totalResult] = await Promise.all([
      databaseService.userChallengeParticipation.aggregate(pipeline).toArray(),
      databaseService.userChallengeParticipation.aggregate(totalPipeline).toArray()
    ])

    return {
      user_challenges,
      total: totalResult[0]?.total || 0
    }
  }

  async getUserChallengeProgress({
    id,
    week,
    day,
    user_id,
    role
  }: {
    id: string
    user_id: string
    role: UserRole
    week: number
    day: number
  }) {
    const userChallenge = await databaseService.userChallengeParticipation.findOne({
      _id: new ObjectId(id)
    })
    if (!userChallenge) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const conditions: Filter<UserChallengeParticipationProgress> = {
      user_challenge_participation_id: new ObjectId(id)
    }
    if (week) {
      conditions.week = week
    }
    if (day) {
      conditions.day = day
    }
    const userChallengeParticipationProgress = await databaseService.userChallengeParticipationProgress
      .aggregate([
        {
          $match: conditions
        },
        {
          $lookup: {
            from: 'health_plan_details',
            localField: 'health_plan_detail_id',
            foreignField: '_id',
            as: 'health_plan_detail'
          }
        },
        {
          $project: {
            _id: 1,
            user_challenge_participation_id: 1,
            date: 1,
            week: 1,
            day: 1,
            health_plan_detail_id: 1,
            completed_workouts: 1,
            completed_nutritions: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            health_plan_detail: 1
          }
        }
      ])
      .toArray()

    const result = userChallengeParticipationProgress.map((item) => {
      const total_workouts = item.health_plan_detail[0]?.workout_details?.length || 0
      const total_nutritions = item.health_plan_detail[0]?.nutrition_details?.length || 0
      const totalItem = total_workouts + total_nutritions
      const completedItem = item.completed_workouts.length + item.completed_nutritions.length
      return {
        ...item,
        total_workouts: item.health_plan_detail[0]?.workout_details?.length || 0,
        total_nutritions: item.health_plan_detail[0]?.nutrition_details?.length || 0,
        finish_percent: totalItem > 0 ? Math.round((completedItem / totalItem) * 100) : 0
      }
    })

    return result
  }
  async getUserChallengeProgressByChallengeId({
    id,
    week,
    day,
    user_id,
    role
  }: {
    id: string
    user_id: string
    role: UserRole
    week: number
    day: number
  }) {
    const userChallenge = await databaseService.userChallengeParticipation.findOne({
      challenge_id: new ObjectId(id)
    })
    if (!userChallenge) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_HAVE_NOT_JOINED_CHALLENGE,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const conditions: Filter<UserChallengeParticipationProgress> = {
      user_challenge_participation_id: new ObjectId(userChallenge._id)
    }
    if (week) {
      conditions.week = week
    }
    if (day) {
      conditions.day = day
    }
    const userChallengeParticipationProgress = await databaseService.userChallengeParticipationProgress
      .aggregate([
        {
          $match: conditions
        },
        {
          $lookup: {
            from: 'health_plan_details',
            localField: 'health_plan_detail_id',
            foreignField: '_id',
            as: 'health_plan_detail'
          }
        },
        {
          $project: {
            _id: 1,
            user_challenge_participation_id: 1,
            date: 1,
            week: 1,
            day: 1,
            health_plan_detail_id: 1,
            completed_workouts: 1,
            completed_nutritions: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            health_plan_detail: 1
          }
        }
      ])
      .toArray()

    const result = userChallengeParticipationProgress.map((item) => {
      const total_workouts = item.health_plan_detail[0]?.workout_details?.length || 0
      const total_nutritions = item.health_plan_detail[0]?.nutrition_details?.length || 0
      const totalItem = total_workouts + total_nutritions
      const completedItem = item.completed_workouts.length + item.completed_nutritions.length
      return {
        ...item,
        total_workouts: item.health_plan_detail[0]?.workout_details?.length || 0,
        total_nutritions: item.health_plan_detail[0]?.nutrition_details?.length || 0,
        finish_percent: totalItem > 0 ? Math.round((completedItem / totalItem) * 100) : 0
      }
    })

    return result
  }
  async getUserChallengeOverview({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const userChallenge = await databaseService.userChallengeParticipation.findOne({
      _id: new ObjectId(id)
    })
    if (!userChallenge) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const healthPlan = await databaseService.healthPlans.findOne({
      _id: userChallenge.health_plan_id
    })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const [completedDays, totalCompletedWorkouts, totalCompletedNutritions, healthPlanDetails] = await Promise.all([
      databaseService.userChallengeParticipationProgress.countDocuments({
        user_challenge_participation_id: new ObjectId(id),
        status: GeneralStatus.Done
      }),
      databaseService.userChallengeParticipationProgress
        .aggregate([
          {
            $match: {
              user_challenge_participation_id: new ObjectId(id)
            }
          },
          {
            $group: {
              _id: null,
              totalCompletedWorkouts: { $sum: { $size: '$completed_workouts' } }
            }
          }
        ])
        .toArray(),
      databaseService.userChallengeParticipationProgress
        .aggregate([
          {
            $match: {
              user_challenge_participation_id: new ObjectId(id)
            }
          },
          {
            $group: {
              _id: null,
              totalCompletedNutritions: { $sum: { $size: '$completed_nutritions' } }
            }
          }
        ])
        .toArray(),
      databaseService.healthPlanDetails
        .find({
          _id: { $in: healthPlan.details }
        })
        .toArray()
    ])

    const totalDays = healthPlan.details.length

    const totalCompletedWorkoutsCount = totalCompletedWorkouts[0]?.totalCompletedWorkouts || 0
    const totalCompletedNutritionsCount = totalCompletedNutritions[0]?.totalCompletedNutritions || 0
    const totalWorkouts = healthPlanDetails.reduce((acc, detail) => {
      return acc + (detail.workout_details?.length || 0)
    }, 0)
    const totalNutritions = healthPlanDetails.reduce((acc, detail) => {
      return acc + (detail.nutrition_details?.length || 0)
    }, 0)
    return {
      id: userChallenge._id,
      user_id: userChallenge.user_id,
      challenge_id: userChallenge.challenge_id,
      health_plan_id: userChallenge.health_plan_id,
      start_date: userChallenge.start_date,
      end_date: userChallenge.end_date,
      status: userChallenge.status,
      total_days: totalDays,
      completed_days: completedDays,
      total_workouts: totalWorkouts,
      total_nutritions: totalNutritions,
      completed_workouts: totalCompletedWorkoutsCount,
      completed_nutritions: totalCompletedNutritionsCount,
      completion_percentage_by_days: Math.round((completedDays / totalDays) * 100)
    }
  }
  async getUserChallengeOverviewByChallengeId({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const userChallenge = await databaseService.userChallengeParticipation.findOne({
      challenge_id: new ObjectId(id)
    })
    if (!userChallenge) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_HAVE_NOT_JOINED_CHALLENGE,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const healthPlan = await databaseService.healthPlans.findOne({
      _id: userChallenge.health_plan_id
    })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const [completedDays, totalCompletedWorkouts, totalCompletedNutritions, healthPlanDetails] = await Promise.all([
      databaseService.userChallengeParticipationProgress.countDocuments({
        user_challenge_participation_id: new ObjectId(userChallenge._id),
        status: GeneralStatus.Done
      }),
      databaseService.userChallengeParticipationProgress
        .aggregate([
          {
            $match: {
              user_challenge_participation_id: new ObjectId(userChallenge._id)
            }
          },
          {
            $group: {
              _id: null,
              totalCompletedWorkouts: { $sum: { $size: '$completed_workouts' } }
            }
          }
        ])
        .toArray(),
      databaseService.userChallengeParticipationProgress
        .aggregate([
          {
            $match: {
              user_challenge_participation_id: new ObjectId(userChallenge._id)
            }
          },
          {
            $group: {
              _id: null,
              totalCompletedNutritions: { $sum: { $size: '$completed_nutritions' } }
            }
          }
        ])
        .toArray(),
      databaseService.healthPlanDetails
        .find({
          _id: { $in: healthPlan.details }
        })
        .toArray()
    ])

    const totalDays = healthPlan.details.length

    const totalCompletedWorkoutsCount = totalCompletedWorkouts[0]?.totalCompletedWorkouts || 0
    const totalCompletedNutritionsCount = totalCompletedNutritions[0]?.totalCompletedNutritions || 0
    const totalWorkouts = healthPlanDetails.reduce((acc, detail) => {
      return acc + (detail.workout_details?.length || 0)
    }, 0)
    const totalNutritions = healthPlanDetails.reduce((acc, detail) => {
      return acc + (detail.nutrition_details?.length || 0)
    }, 0)
    return {
      id: userChallenge._id,
      user_id: userChallenge.user_id,
      challenge_id: userChallenge.challenge_id,
      health_plan_id: userChallenge.health_plan_id,
      start_date: userChallenge.start_date,
      end_date: userChallenge.end_date,
      status: userChallenge.status,
      total_days: totalDays,
      completed_days: completedDays,
      total_workouts: totalWorkouts,
      total_nutritions: totalNutritions,
      completed_workouts: totalCompletedWorkoutsCount,
      completed_nutritions: totalCompletedNutritionsCount,
      completion_percentage_by_days: Math.round((completedDays / totalDays) * 100)
    }
  }

  async add({ healthPlan, user_id, role }: { user_id: string; role: UserRole; healthPlan: HealthPlanReqBody }) {
    const newHealthPlan = new HealthPlans({
      ...healthPlan,
      details: [],
      user_id: role === UserRole.User ? new ObjectId(user_id) : undefined
    })
    const healthPlanInserted = await databaseService.healthPlans.insertOne(newHealthPlan)

    return {
      ...newHealthPlan,
      details: [],
      _id: healthPlanInserted.insertedId
    }
  }
  async updateProgressEachDay({
    userChallengeParticipationProgressId,
    completed_workouts,
    completed_nutritions,
    user_id,
    role
  }: {
    userChallengeParticipationProgressId: string
    completed_workouts: {
      workout_detail_id: string
      actual_finish_time: number // thời gian thực tế hoàn thành bài tập
    }[]
    completed_nutritions: string[]
    user_id: string
    role: UserRole
  }) {
    const userChallengeParticipationProgress = await databaseService.userChallengeParticipationProgress.findOne({
      _id: new ObjectId(userChallengeParticipationProgressId)
    })
    if (!userChallengeParticipationProgress) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_PROGRESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const completed_workouts_update = completed_workouts.map((workout) => {
      return {
        workout_detail_id: new ObjectId(workout.workout_detail_id),
        actual_finish_time: workout.actual_finish_time
      }
    })
    const completed_nutritions_ids = completed_nutritions.map((nutrition) => new ObjectId(nutrition))

    // check if completed_workouts_ids and completed_nutritions_ids are already in the health_plan_detail
    const healthPlanDetail = await databaseService.healthPlanDetails.findOne({
      _id: userChallengeParticipationProgress.health_plan_detail_id
    })

    if (!healthPlanDetail) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isCompletedWorkoutIdsExist = isIds1ContainInId2(
      completed_workouts_update.map((item) => item.workout_detail_id),
      healthPlanDetail.workout_details!.map((item) => item._id!)
    )

    const isCompletedNutritionIdsExist = isIds1ContainInId2(
      completed_nutritions_ids,
      healthPlanDetail.nutrition_details!.map((item) => item._id!)
    )

    if (!isCompletedWorkoutIdsExist) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.COMPLETED_WORKOUT_IDS_NOT_IN_HEALTH_PLAN_DETAIL,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (!isCompletedNutritionIdsExist) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.COMPLETED_NUTRITION_IDS_NOT_IN_HEALTH_PLAN_DETAIL,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Filter new completed_workouts_ids and completed_nutritions_ids
    const newCompletedWorkouts = completed_workouts_update.filter(
      (workout) =>
        !userChallengeParticipationProgress.completed_workouts.some((completedWorkout) =>
          completedWorkout.workout_detail_id.equals(workout.workout_detail_id)
        )
    )

    const newCompletedNutritions = completed_nutritions_ids.filter(
      (nutritionId) =>
        !userChallengeParticipationProgress.completed_nutritions.some((completedNutritionId) =>
          completedNutritionId.equals(nutritionId)
        )
    )
    const result = await databaseService.userChallengeParticipationProgress.findOneAndUpdate(
      {
        _id: new ObjectId(userChallengeParticipationProgressId)
      },
      {
        $push: {
          completed_workouts: { $each: newCompletedWorkouts },
          completed_nutritions: { $each: newCompletedNutritions }
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    // Update UserChallengeParticipationProgress status if all workouts and nutritions are completed
    const isAllWorkoutsCompleted = result?.completed_workouts.length === healthPlanDetail?.workout_details?.length
    const isAllNutritionsCompleted = result?.completed_nutritions.length === healthPlanDetail?.nutrition_details?.length
    if (isAllWorkoutsCompleted && isAllNutritionsCompleted) {
      const result2 = await databaseService.userChallengeParticipationProgress.findOneAndUpdate(
        {
          _id: new ObjectId(userChallengeParticipationProgressId)
        },
        {
          $set: {
            status: GeneralStatus.Done
          }
        }
      )
      return result2
    }
    return result
  }
  async finishChallenge({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const userChallenge = await databaseService.userChallengeParticipation.findOne({
      _id: new ObjectId(id)
    })
    if (!userChallenge) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (userChallenge.status === UserChallengeParticipationStatus.Pending) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_STARTED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if all progress is undone
    const allProgress = await databaseService.userChallengeParticipationProgress
      .find({
        user_challenge_participation_id: new ObjectId(id)
      })
      .toArray()

    const allProgressUndone = allProgress.every((progress) => progress.status === GeneralStatus.Undone)
    if (allProgressUndone) {
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.YOU_HAVE_NOT_COMPLETED_ANY_PROGRESS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const result = await databaseService.userChallengeParticipation.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          status: UserChallengeParticipationStatus.Completed
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
  // async startChallenge({
  //   id,
  //   start_date,
  //   user_id,
  //   role
  // }: {
  //   id: string
  //   user_id: string
  //   role: UserRole
  //   start_date: Date
  // }) {
  //   const userChallenge = await databaseService.userChallengeParticipation.findOne({
  //     _id: new ObjectId(id)
  //   })
  //   if (!userChallenge) {
  //     throw new ErrorWithStatus({
  //       message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_FOUND,
  //       status: HTTP_STATUS.NOT_FOUND
  //     })
  //   }
  //   // Check if the challenge is pending
  //   if (userChallenge.status !== UserChallengeParticipationStatus.Pending) {
  //     throw new ErrorWithStatus({
  //       message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_PENDING,
  //       status: HTTP_STATUS.BAD_REQUEST
  //     })
  //   }

  //   const healthPlan = await databaseService.healthPlans.findOne({
  //     _id: userChallenge.health_plan_id
  //   })
  //   if (!healthPlan) {
  //     throw new ErrorWithStatus({
  //       message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
  //       status: HTTP_STATUS.NOT_FOUND
  //     })
  //   }
  //   const millisecondsInOneDay = 24 * 60 * 60 * 1000
  //   const durationInDays = Math.ceil(
  //     (new Date(healthPlan.end_date!).getTime() - new Date(healthPlan.start_date!).getTime()) / millisecondsInOneDay
  //   )
  //   const end_date = new Date(new Date(start_date).getTime() + durationInDays * millisecondsInOneDay)
  //   const result = await databaseService.userChallengeParticipation.findOneAndUpdate(
  //     {
  //       _id: new ObjectId(id)
  //     },
  //     {
  //       $set: {
  //         start_date,
  //         end_date,
  //         status: UserChallengeParticipationStatus.Ongoing
  //       },
  //       $currentDate: {
  //         updated_at: true
  //       }
  //     },
  //     {
  //       returnDocument: 'after' // Trả về giá trị mới
  //     }
  //   )
  //   // generate userChallengeParticipationProgress
  //   // Find all health plan details
  //   const healthPlanDetails = await databaseService.healthPlanDetails
  //     .find(
  //       {
  //         _id: { $in: healthPlan.details }
  //       },
  //       {
  //         sort: {
  //           week: 1,
  //           day: 1
  //         }
  //       }
  //     )
  //     .toArray()
  //   // Generate userChallengeParticipationProgress for each health plan detail
  //   const userChallengeParticipationProgresses = generateProgressFromDetails({
  //     startDate: start_date,
  //     healthPlanDetails,
  //     userChallengeParticipationId: result!._id
  //   })
  //   // Insert userChallengeParticipationProgress into the database
  //   await databaseService.userChallengeParticipationProgress.insertMany(userChallengeParticipationProgresses)
  //   return result
  // }
  async startChallenge({
    id,
    start_date,
    user_id,
    role
  }: {
    id: string
    user_id: string
    role: UserRole
    start_date: Date
  }) {
    const session: ClientSession = databaseService.startSession()

    try {
      let result

      await session.withTransaction(async () => {
        const userChallenge = await databaseService.userChallengeParticipation.findOne(
          { _id: new ObjectId(id) },
          { session }
        )
        if (!userChallenge) {
          throw new ErrorWithStatus({
            message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        if (userChallenge.status !== UserChallengeParticipationStatus.Pending) {
          throw new ErrorWithStatus({
            message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_PENDING,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        const healthPlan = await databaseService.healthPlans.findOne({ _id: userChallenge.health_plan_id }, { session })
        if (!healthPlan) {
          throw new ErrorWithStatus({
            message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        const millisecondsInOneDay = 24 * 60 * 60 * 1000
        const durationInDays = Math.ceil(
          (new Date(healthPlan.end_date!).getTime() - new Date(healthPlan.start_date!).getTime()) / millisecondsInOneDay
        )
        const end_date = new Date(new Date(start_date).getTime() + durationInDays * millisecondsInOneDay)

        result = await databaseService.userChallengeParticipation.findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              start_date,
              end_date,
              status: UserChallengeParticipationStatus.Ongoing
            },
            $currentDate: {
              updated_at: true
            }
          },
          {
            returnDocument: 'after',
            session
          }
        )

        // Generate userChallengeParticipationProgress for each health plan detail
        const healthPlanDetails = await databaseService.healthPlanDetails
          .find(
            { _id: { $in: healthPlan.details } },
            {
              sort: {
                week: 1,
                day: 1
              },
              session
            }
          )
          .toArray()

        const userChallengeParticipationProgresses = generateProgressFromDetails({
          startDate: start_date,
          healthPlanDetails,
          userChallengeParticipationId: new ObjectId(id)
        })

        if (userChallengeParticipationProgresses.length > 0) {
          await databaseService.userChallengeParticipationProgress.insertMany(userChallengeParticipationProgresses, {
            session
          })
        }
      })

      return result!.value
    } catch (error) {
      console.error('Transaction error:', error)
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.START_CHALLENGE_FAILED + '.' + error,
        status: HTTP_STATUS.INTERNAL_SERVER
      })
    } finally {
      await session.endSession()
    }
  }

  async deleteUserChallenge({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const session: ClientSession = databaseService.startSession()
    try {
      let result
      await session.withTransaction(async () => {
        const userChallenge = await databaseService.userChallengeParticipation.findOne(
          {
            _id: new ObjectId(id)
          },
          { session }
        )
        if (!userChallenge) {
          throw new ErrorWithStatus({
            message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        if (userChallenge.user_id.toString() !== user_id) {
          throw new ErrorWithStatus({
            message: USER_CHALLENGE_PARTICIPATION_MESSAGES.USER_CHALLENGE_PARTICIPATION_NOT_BELONG_TO_USER,
            status: HTTP_STATUS.FORBIDDEN
          })
        }
        result = await databaseService.userChallengeParticipation.findOneAndDelete(
          {
            _id: new ObjectId(id)
          },
          { session }
        )
        await databaseService.userChallengeParticipationProgress.deleteMany(
          {
            user_challenge_participation_id: new ObjectId(id)
          },
          { session }
        )
      })
      return result!.value
    } catch (error) {
      console.error('Transaction error:', error)
      throw new ErrorWithStatus({
        message: USER_CHALLENGE_PARTICIPATION_MESSAGES.DELETE_CHALLENGE_FAILED + '.' + error,
        status: HTTP_STATUS.INTERNAL_SERVER
      })
    } finally {
      await session.endSession()
    }
  }
}
const userChallengeParticipationService = new UserChallengeParticipationService()
export default userChallengeParticipationService

const generateProgressFromDetails = ({
  startDate,
  healthPlanDetails,
  userChallengeParticipationId
}: {
  startDate: Date
  healthPlanDetails: HealthPlanDetails[]
  userChallengeParticipationId: ObjectId
}) => {
  const millisecondsInOneDay = 24 * 60 * 60 * 1000
  let currentDate = new Date(startDate)

  const progresses = healthPlanDetails.map((detail) => {
    const progress = new UserChallengeParticipationProgress({
      user_challenge_participation_id: userChallengeParticipationId,
      health_plan_detail_id: detail._id!,
      date: new Date(currentDate),
      week: detail.week,
      day: detail.day,
      completed_workouts: [],
      completed_nutritions: [],
      status: GeneralStatus.Undone
    })

    // Cộng thêm 1 ngày cho lần tiếp theo
    currentDate = new Date(currentDate.getTime() + millisecondsInOneDay)

    return progress
  })

  return progresses
}

export const isIds1ContainInId2 = (ids1: ObjectId[], ids2: ObjectId[]) => {
  const ids2Set = new Set(ids2.map((id) => id.toHexString()))
  return ids1.every((id1) => ids2Set.has(id1.toHexString()))
}
