import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Meals from '~/models/schemas/Meals.schema'
import { GeneralQueryStatusFilter, GeneralStatus, MealType, UserRole } from '~/constants/enums'
import {
  MEALS_MESSAGES,
  SETS_MESSAGES,
  WORKOUT_PLAN_DETAILS_MESSAGES,
  WORKOUT_PLAN_MESSAGES
} from '~/constants/messages'
import { UpdateWorkoutPlanDetailReqBody, WorkoutPlanDetailReqBody } from '~/models/requests/WorkoutPlanDetail.requests'
import { omit } from 'lodash'
import WorkoutPlanDetails from '~/models/schemas/WorkoutPlanDetails.schema'
import setService from './sets.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { SetReqBody } from '~/models/requests/Set.requests'

class WorkoutPlanDetailsService {
  async search({
    status,
    workoutPlanId,
    week
  }: {
    week?: number
    workoutPlanId: string
    status: GeneralQueryStatusFilter
  }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(workoutPlanId) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    let result = workoutPlan.details

    if (status !== GeneralQueryStatusFilter.All) {
      let tempStatus: GeneralStatus
      if (status === GeneralQueryStatusFilter.Done) {
        tempStatus = GeneralStatus.Done
      }
      if (status === GeneralQueryStatusFilter.Undone) {
        tempStatus = GeneralStatus.Undone
      }
      result = result.filter((detail: WorkoutPlanDetails) => {
        return detail.status === tempStatus
      })
    }

    if (week) {
      result = result.filter((detail: WorkoutPlanDetails) => {
        return detail.week === Number(week)
      })
    }

    return result
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

  async getById({ id, workoutPlanId }: { id: string; workoutPlanId: string }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({
      _id: new ObjectId(workoutPlanId)
    })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const workoutPlanDetail = workoutPlan.details.find((detail) => detail._id?.toString() === id)

    if (!workoutPlanDetail) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const sets = await Promise.all(
      workoutPlanDetail.sets.map((s) =>
        databaseService.sets.findOne(
          { _id: s },
          {
            projection: {
              set_exercises: 0
            }
          }
        )
      )
    )

    return {
      ...workoutPlanDetail,
      set_details: sets
    }
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
  async add({
    workout_plan_detail,
    user_id,
    workoutPlanId,
    role
  }: {
    workout_plan_detail: WorkoutPlanDetailReqBody
    user_id: string
    workoutPlanId: string
    role: UserRole
  }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(workoutPlanId) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const newWorkoutPlanDetail = new WorkoutPlanDetails({
      ...omit(workout_plan_detail, ['sets']),
      sets: [],
      _id: new ObjectId()
    })

    const newSets = await Promise.all(
      workout_plan_detail.sets.map(async (set) => {
        const newSet = await setService.add({
          role,
          user_id,
          set
        })
        return newSet
      })
    )

    newWorkoutPlanDetail.sets = newSets.map((set) => new ObjectId(set._id))

    await databaseService.workoutPlans.findOneAndUpdate(
      {
        _id: new ObjectId(workoutPlanId)
      },
      {
        $push: {
          details: newWorkoutPlanDetail
        }
      }
    )
    // const workoutPlanDetailInserted = await databaseService.workoutPlanDetails.insertOne(newWorkoutPlanDetail)

    return {
      ...newWorkoutPlanDetail
      // _id: workoutPlanDetailInserted.insertedId
    }
  }
  async addSet({
    user_id,
    workoutPlanId,
    workoutPlanDetailId,
    role,
    set
  }: {
    workoutPlanDetailId: string
    user_id: string
    workoutPlanId: string
    role: UserRole
    set: SetReqBody
  }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(workoutPlanId) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const workout_plan_detail = workoutPlan.details.find((detail) => detail._id?.toString() === workoutPlanDetailId)

    if (!workout_plan_detail) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const newSet = await setService.add({
      role,
      user_id,
      set
    })
    workout_plan_detail.sets.push(new ObjectId(newSet._id))
    await databaseService.workoutPlans.findOneAndUpdate(
      {
        _id: new ObjectId(workoutPlanId)
      },
      {
        $set: {
          details: workoutPlan.details
        }
      }
    )
    // const workoutPlanDetailInserted = await databaseService.workoutPlanDetails.insertOne(newWorkoutPlanDetail)

    return {
      ...workout_plan_detail
      // _id: workoutPlanDetailInserted.insertedId
    }
  }
  async deleteSet({
    user_id,
    workoutPlanId,
    workoutPlanDetailId,
    role,
    setId
  }: {
    workoutPlanDetailId: string
    user_id: string
    workoutPlanId: string
    role: UserRole
    setId: string
  }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(workoutPlanId) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const workout_plan_detail = workoutPlan.details.find((detail) => detail._id?.toString() === workoutPlanDetailId)

    if (!workout_plan_detail) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const set = workout_plan_detail.sets.find((s) => s.toString() === setId)
    if (!set) {
      throw new ErrorWithStatus({
        message: SETS_MESSAGES.SET_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    await databaseService.sets.deleteOne({ _id: new ObjectId(setId) })
    workout_plan_detail.sets = workout_plan_detail.sets.filter((s) => s.toString() !== setId)
    await databaseService.workoutPlans.findOneAndUpdate(
      {
        _id: new ObjectId(workoutPlanId)
      },
      {
        $set: {
          details: workoutPlan.details
        }
      }
    )
    // const workoutPlanDetailInserted = await databaseService.workoutPlanDetails.insertOne(newWorkoutPlanDetail)

    return {
      ...workout_plan_detail
      // _id: workoutPlanDetailInserted.insertedId
    }
  }
  async update({
    id,
    updateWorkoutPlanDetail,
    workoutPlanId
  }: {
    id: string
    updateWorkoutPlanDetail: UpdateWorkoutPlanDetailReqBody
    workoutPlanId: string
  }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(workoutPlanId) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const workout_plan_detail = workoutPlan.details.find((detail) => detail._id?.toString() === id)
    if (!workout_plan_detail) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const temp = {
      ...workout_plan_detail,
      ...updateWorkoutPlanDetail
    }

    const updatedWorkoutPlanDetail = await databaseService.workoutPlans.findOneAndUpdate(
      {
        _id: new ObjectId(workoutPlanId),
        'details._id': new ObjectId(id)
      },
      {
        $set: {
          'details.$': {
            ...temp
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return updatedWorkoutPlanDetail
  }
  async delete({ id, workoutPlanId }: { id: string; workoutPlanId: string }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(workoutPlanId) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const workout_plan_detail = workoutPlan.details.find((detail) => detail._id?.toString() === id)
    if (!workout_plan_detail) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_DETAILS_MESSAGES.WORKOUT_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.sets.deleteMany({
      _id: {
        $in: workout_plan_detail.sets
      }
    })

    const result = await databaseService.workoutPlans.findOneAndUpdate(
      {
        _id: new ObjectId(workoutPlanId)
      },
      {
        $pull: {
          details: {
            _id: new ObjectId(id)
          }
        }
      }
    )

    return result
  }
}
const workoutPlanDetailsService = new WorkoutPlanDetailsService()
export default workoutPlanDetailsService
