import { Filter, ObjectId } from 'mongodb'
import databaseService from './database.services'
import { GeneralStatus, UserRole } from '~/constants/enums'
import {
  HEALTH_PLAN_DETAILS_MESSAGES,
  HEALTH_PLAN_MESSAGES,
  MEALS_MESSAGES,
  SETS_MESSAGES,
  WORKOUT_PLAN_DETAILS_MESSAGES
} from '~/constants/messages'
import setService from './sets.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { SetReqBody } from '~/models/requests/Set.requests'
import HealthPlanDetails, {
  NutritionHealthPlanDetail,
  WorkoutHealthPlanDetail
} from '~/models/schemas/HealthPlanDetails.schema'
import mealService from './meals.services'
import { HealthPlanDetailReqBody, UpdateHealthPlanDetailReqBody } from '~/models/requests/HealthPlanDetails.requests'

class HealthPlanDetailsService {
  async search({ healthPlanId, week }: { week?: number; healthPlanId: string }) {
    const healthPlan = await databaseService.healthPlans.findOne({ _id: new ObjectId(healthPlanId) })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const conditions: Filter<HealthPlanDetails> = {
      _id: { $in: healthPlan.details.map((item) => new ObjectId(item)) }
    }

    if (week) {
      conditions.week = Number(week)
    }

    // No week provided, return all details
    const result = await databaseService.healthPlanDetails
      .find(conditions, {
        sort: {
          week: 1,
          day: 1
        }
      })
      .toArray()

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

  async getById({ id }: { id: string }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (healthPlanDetails.workout_details) {
      healthPlanDetails.workout_details = healthPlanDetails.workout_details?.sort(
        (a, b) => a.orderNumber! - b.orderNumber!
      )
      const setDetails = await Promise.all(
        healthPlanDetails?.workout_details?.map(async (set) => {
          return setService.getById({
            id: set.set.toString(),
            user_id: '',
            role: UserRole.User
          })
        })
      )
      healthPlanDetails.workout_details = healthPlanDetails.workout_details.map((set, index) => ({
        ...set,
        setDetails: setDetails[index]
      }))
    }

    if (healthPlanDetails.nutrition_details) {
      healthPlanDetails.nutrition_details = healthPlanDetails.nutrition_details?.sort(
        (a, b) => a.orderNumber! - b.orderNumber!
      )
      const nutrition_details = await Promise.all(
        healthPlanDetails?.nutrition_details?.map(async (nutrition_detail) => {
          return mealService.getById({
            meal_id: nutrition_detail.meal.toString(),
            user_id: '',
            role: UserRole.User
          })
        })
      )
      healthPlanDetails.nutrition_details = healthPlanDetails.nutrition_details.map((nutrition_detail, index) => ({
        ...nutrition_detail,
        mealDetails: nutrition_details[index]
      }))
    }
    return healthPlanDetails
  }
  async add({
    health_plan_detail,
    user_id,
    healthPlanId,
    role
  }: {
    health_plan_detail: HealthPlanDetailReqBody
    user_id: string
    healthPlanId: string
    role: UserRole
  }) {
    const healthPlan = await databaseService.healthPlans.findOne({ _id: new ObjectId(healthPlanId) })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const setIdList = health_plan_detail.workout_details?.map((item) => item.set)
    const nutritionIdList = health_plan_detail.nutrition_details?.map((item) => item.meal)

    const [sets, meals] = await Promise.all([
      databaseService.sets
        .find({
          _id: { $in: setIdList?.map((item) => new ObjectId(item)) }
        })
        .toArray(),
      databaseService.meals
        .find({
          _id: { $in: nutritionIdList?.map((item) => new ObjectId(item)) }
        })
        .toArray()
    ])
    if (sets.length !== setIdList?.length) {
      throw new ErrorWithStatus({
        message: SETS_MESSAGES.SOME_SET_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (meals.length !== nutritionIdList?.length) {
      throw new ErrorWithStatus({
        message: MEALS_MESSAGES.SOME_MEALS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const newHealthPlanDetail = new HealthPlanDetails({
      ...health_plan_detail,
      workout_details: health_plan_detail.workout_details?.map((workout_detail, index) => ({
        set: new ObjectId(workout_detail.set),
        orderNumber: index
      })),
      nutrition_details: health_plan_detail.nutrition_details?.map((nutrition_detail, index) => ({
        meal: new ObjectId(nutrition_detail.meal),
        orderNumber: index
      })),
      _id: new ObjectId()
    })

    const healthPlanDetailInserted = await databaseService.healthPlanDetails.insertOne(newHealthPlanDetail)

    await databaseService.healthPlans.findOneAndUpdate(
      {
        _id: new ObjectId(healthPlanId)
      },
      {
        $push: {
          details: healthPlanDetailInserted.insertedId
        }
      }
    )
    const result = await databaseService.healthPlanDetails.findOne(healthPlanDetailInserted.insertedId)

    return result
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
  async update({ id, updateHealthPlanDetail }: { id: string; updateHealthPlanDetail: UpdateHealthPlanDetailReqBody }) {
    const health_plan_detail = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!health_plan_detail) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const updatedHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateHealthPlanDetail
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return updatedHealthPlanDetail
  }
  async delete({ id, healthPlanId }: { id: string; healthPlanId: string }) {
    const healthPlan = await databaseService.healthPlans.findOne({ _id: new ObjectId(healthPlanId) })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const health_plan_detail = healthPlan.details.find((detail) => detail?.toString() === id)
    if (!health_plan_detail) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.healthPlanDetails.deleteOne({
      _id: new ObjectId(id)
    })

    const result = await databaseService.healthPlans.findOneAndUpdate(
      {
        _id: new ObjectId(healthPlanId)
      },
      {
        $pull: {
          details: new ObjectId(id)
        }
      }
    )

    return result
  }

  async addSetForWorkoutDetails({
    id,
    sets
  }: {
    id: string
    sets: {
      id: string
      orderNumber: number
    }[]
  }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const items = sets.map((item) => {
      return {
        _id: new ObjectId(),
        set: new ObjectId(item.id),
        orderNumber: item.orderNumber,
        status: GeneralStatus.Undone
      }
    })
    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $push: {
          workout_details: {
            $each: items
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return newHealthPlanDetail?.workout_details
  }
  async updateOrderNumberOfItemsInWorkoutDetails({
    id,
    workout_details
  }: {
    id: string
    workout_details: {
      id: string
      orderNumber: number
    }[]
  }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // Build lại workout_details với orderNumber cập nhật
    const updatedWorkoutDetails = healthPlanDetails.workout_details?.map((detail: WorkoutHealthPlanDetail) => {
      const foundSet = workout_details.find((item) => item.id === detail._id!.toString())
      if (foundSet) {
        return {
          ...detail,
          orderNumber: foundSet.orderNumber
        }
      }
      return detail
    })

    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          workout_details: updatedWorkoutDetails
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return newHealthPlanDetail?.workout_details
  }
  async updateWorkoutDetailsStatus({ id, ids, status }: { id: string; ids: string[]; status: GeneralStatus }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        'workout_details._id': { $in: ids.map((item) => new ObjectId(item)) }
      },
      {
        $set: {
          'workout_details.$[elem].status': status
        }
      },
      {
        arrayFilters: [{ 'elem._id': { $in: ids.map((item) => new ObjectId(item)) } }],
        returnDocument: 'after'
      }
    )
    // Check all status of workout_details and nutrition_details to update health_plan_detail status
    const isWorkoutDetailsAllDone = newHealthPlanDetail?.workout_details?.every(
      (item) => item.status === GeneralStatus.Done
    )
    const isNutritionDetailsAllDone = newHealthPlanDetail?.nutrition_details?.every(
      (item) => item.status === GeneralStatus.Done
    )

    if (isWorkoutDetailsAllDone && isNutritionDetailsAllDone) {
      await databaseService.healthPlanDetails.findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $set: {
            status: GeneralStatus.Done
          }
        }
      )
    }
    return newHealthPlanDetail?.workout_details
  }
  async deleteItemInWorkoutDetails({ id, ids }: { id: string; ids: string[] }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $pull: {
          workout_details: {
            _id: { $in: ids.map((item) => new ObjectId(item)) }
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return newHealthPlanDetail?.workout_details
  }
  async addMealForNutritionDetails({ id, meals }: { id: string; meals: { id: string; orderNumber: number }[] }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const items = meals.map((item) => {
      return {
        _id: new ObjectId(),
        meal: new ObjectId(item.id),
        status: GeneralStatus.Undone,
        orderNumber: item.orderNumber
      }
    })
    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $push: {
          nutrition_details: {
            $each: items
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return newHealthPlanDetail?.nutrition_details
  }
  async updateItemStatusInNutritionDetails({ id, ids, status }: { id: string; ids: string[]; status: GeneralStatus }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        'nutrition_details._id': { $in: ids.map((item) => new ObjectId(item)) }
      },
      {
        $set: {
          'nutrition_details.$[elem].status': status
        }
      },
      {
        arrayFilters: [{ 'elem._id': { $in: ids.map((item) => new ObjectId(item)) } }],
        returnDocument: 'after'
      }
    )
    // Check all status of workout_details and nutrition_details to update health_plan_detail status
    const isWorkoutDetailsAllDone = newHealthPlanDetail?.workout_details?.every(
      (item) => item.status === GeneralStatus.Done
    )
    const isNutritionDetailsAllDone = newHealthPlanDetail?.nutrition_details?.every(
      (item) => item.status === GeneralStatus.Done
    )

    if (isWorkoutDetailsAllDone && isNutritionDetailsAllDone) {
      await databaseService.healthPlanDetails.findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $set: {
            status: GeneralStatus.Done
          }
        }
      )
    }
    return newHealthPlanDetail?.nutrition_details
  }
  async updateOrderNumberOfItemsInNutritionDetails({
    id,
    nutrition_details
  }: {
    id: string
    nutrition_details: {
      id: string
      orderNumber: number
    }[]
  }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // Build lại nutrition_details với orderNumber cập nhật
    const updatedMealDetails = healthPlanDetails.nutrition_details?.map((detail: NutritionHealthPlanDetail) => {
      const foundSet = nutrition_details.find((item) => item.id === detail._id!.toString())
      if (foundSet) {
        return {
          ...detail,
          orderNumber: foundSet.orderNumber
        }
      }
      return detail
    })

    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          nutrition_details: updatedMealDetails
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return newHealthPlanDetail?.nutrition_details
  }

  async deleteItemInNutritionDetails({ id, ids }: { id: string; ids: string[] }) {
    const healthPlanDetails = await databaseService.healthPlanDetails.findOne({
      _id: new ObjectId(id)
    })
    if (!healthPlanDetails) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const newHealthPlanDetail = await databaseService.healthPlanDetails.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $pull: {
          nutrition_details: {
            _id: { $in: ids.map((item) => new ObjectId(item)) }
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return newHealthPlanDetail?.nutrition_details
  }
}
const healthPlanDetailsService = new HealthPlanDetailsService()
export default healthPlanDetailsService
