import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Meals from '~/models/schemas/Meals.schema'
import { ChallengeQueryTypeFilter, ChallengeStatus, MealType, UserRole } from '~/constants/enums'
import { CHALLENGE_MESSAGES, MEALS_MESSAGES } from '~/constants/messages'
import { ChallengeReqBody, UpdateChallengeReqBody } from '~/models/requests/Challenge.requests'
import WorkoutPlans from '~/models/schemas/WorkoutPlans.schema'
import { omit } from 'lodash'
import workoutPlanDetailsService from './workout-plan-details.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MealReqBody } from '~/models/requests/Meal.requests'
import { UpdateWorkoutPlanReqBody } from '~/models/requests/WorkoutPlan.requests'
import Sets from '~/models/schemas/Sets.schema'

class ChallengesService {
  async search({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    type
  }: {
    search?: string
    type: ChallengeQueryTypeFilter
    page?: number
    limit?: number
    sort_by: string
    order_by: string
  }) {
    const conditions: any = {}
    if (search) {
      conditions.name = {
        $regex: search,
        $options: 'i'
      }
    }

    if (type !== ChallengeQueryTypeFilter.All) {
      conditions.type = type
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

  async getAll() {
    const exercises = await databaseService.exercises
      .find(
        {},
        {
          projection: {
            id: 1,
            name: 1
          }
        }
      )
      .toArray()
    return exercises
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
    if (challenge.workout_plan?.details) {
      for (const detail of challenge.workout_plan.details) {
        const sets = await databaseService.sets
          .find({
            _id: {
              $in: detail.sets.map((set: any) => new ObjectId(set))
            }
          })
          .toArray()

        detail.setDetails = sets
      }
    }

    return challenge
  }
  async getMealByDate({ date, user_id }: { date: string; user_id: string }) {
    const inputDate = new Date(date)

    // Get start and end of the day for date range search
    const startOfDay = new Date(inputDate)
    startOfDay.setUTCHours(0, 0, 0, 0)

    const endOfDay = new Date(inputDate)
    endOfDay.setUTCHours(23, 59, 59, 999)

    const meals = await databaseService.meals
      .find(
        {
          user_id: new ObjectId(user_id),
          date: { $gte: startOfDay, $lte: endOfDay }
        },
        {
          projection: {
            dishes: 0
          },
          sort: {
            calories: 1
          }
        }
      )
      .toArray()
    if (!meals) {
      throw new Error(MEALS_MESSAGES.MEAL_NOT_FOUND)
    }
    const breakfasts = meals.filter((meal: Meals) => meal.meal_type === MealType.Breakfast)
    const lunches = meals.filter((meal: Meals) => meal.meal_type === MealType.Lunch)
    const dinners = meals.filter((meal: Meals) => meal.meal_type === MealType.Dinner)
    return {
      breakfasts,
      lunches,
      dinners
    }
  }
  async add({ challenge, role, userId }: { challenge: ChallengeReqBody; role: UserRole; userId: string }) {
    let newMeal: Meals | undefined = undefined
    let newWorkoutPlan: WorkoutPlans | undefined = undefined
    if (challenge.meal) {
      newMeal = new Meals({
        user_id: undefined,
        ...challenge.meal,
        _id: new ObjectId()
      })
    }
    if (challenge.workout_plan) {
      newWorkoutPlan = new WorkoutPlans({
        ...omit(challenge.workout_plan, ['details']),
        details: [],
        user_id: undefined,
        _id: new ObjectId()
      })
      const workoutPlanInserted = await databaseService.workoutPlans.insertOne(newWorkoutPlan)

      const workoutPlanDetails = await Promise.all(
        challenge.workout_plan.details.map((workout_plan_detail) =>
          workoutPlanDetailsService.add({
            workout_plan_detail,
            user_id: userId,
            role,
            workoutPlanId: workoutPlanInserted.insertedId.toString()
          })
        )
      )

      newWorkoutPlan.details = workoutPlanDetails
      newWorkoutPlan._id = workoutPlanInserted.insertedId

      await databaseService.workoutPlans.deleteOne({ _id: workoutPlanInserted.insertedId })
    }

    const challengeInserted = await databaseService.challenges.insertOne({
      ...challenge,
      meal: newMeal || undefined,
      workout_plan: newWorkoutPlan || undefined
    })

    return {
      ...challenge,
      meal: newMeal,
      workout_plan: newWorkoutPlan,
      _id: challengeInserted.insertedId
    }
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
    const result = await databaseService.challenges.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateChallenge
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
  async updateMeal({ id, updateMeal }: { id: string; updateMeal: MealReqBody }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!challenge.meal) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_HAVE_MEAL,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const temp: any = { ...updateMeal }
    if (updateMeal.date) {
      temp.date = new Date(updateMeal.date)
    }
    challenge.meal = {
      ...challenge.meal,
      ...temp,
      updated_at: new Date()
    }
    await databaseService.challenges.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          meal: challenge.meal
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return challenge.meal
  }
  async updateWorkout({ id, updateWorkoutPlan }: { id: string; updateWorkoutPlan: UpdateWorkoutPlanReqBody }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!challenge.workout_plan) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_NOT_HAVE_WORKOUT_PLAN,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const temp: any = { ...updateWorkoutPlan }

    challenge.workout_plan = {
      ...challenge.workout_plan,
      ...temp
    }
    await databaseService.challenges.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          workout_plan: challenge.workout_plan
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return challenge.workout_plan
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

    const isJoined = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      challenges: {
        $elemMatch: {
          _id: new ObjectId(id)
        }
      }
    })

    if (isJoined) {
      throw new ErrorWithStatus({
        message: CHALLENGE_MESSAGES.CHALLENGE_IS_JOINED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (challenge.workout_plan?.details) {
      for (const detail of challenge.workout_plan.details) {
        const sets = await databaseService.sets
          .find({
            _id: {
              $in: detail.sets.map((set) => new ObjectId(set))
            }
          })
          .toArray()

        const newSets = await databaseService.sets.insertMany(
          sets.map((set: Sets) => {
            return new Sets({
              ...omit(set, ['_id']),
              user_id: new ObjectId(user_id)
            })
          })
        )

        detail.sets = Object.values(newSets.insertedIds).map((id) => id)
      }
    }

    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $push: {
          challenges: challenge
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return user
  }

  async activate({ id }: { id: string }) {
    const challenge = await databaseService.challenges.findOne({ _id: new ObjectId(id) })
    if (!challenge) {
      throw new Error(CHALLENGE_MESSAGES.CHALLENGE_NOT_FOUND)
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

    const isUsedByChallenge = await databaseService.users
      .find({
        challenges: {
          $elemMatch: {
            _id: new ObjectId(id)
          }
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
