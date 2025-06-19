import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { MealReqBody } from '~/models/requests/Meal.requests'
import Meals from '~/models/schemas/Meals.schema'
import { MealQueryType, MealType, RoleTypeQueryFilter, UserRole } from '~/constants/enums'
import { MEALS_MESSAGES } from '~/constants/messages'
import { omit } from 'lodash'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

class MealService {
  async getAll({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    user_id,
    role,
    meal_type,
    type,
    max_calories,
    min_calories
  }: {
    search?: string
    meal_type: MealQueryType
    type: RoleTypeQueryFilter
    page?: number
    limit?: number
    user_id?: string
    role: UserRole
    sort_by: string
    order_by: string
    max_calories?: number
    min_calories?: number
  }) {
    const conditions: any = {
      isPartOfHealthTrackingDetail: false
    }
    if (search) {
      conditions.name = {
        $regex: search.trim(),
        $options: 'i'
      }
    }
    if (max_calories) {
      conditions.calories = {
        ...conditions.calories,
        $lte: max_calories
      }
    }
    if (min_calories) {
      conditions.calories = {
        ...conditions.calories,
        $gte: min_calories
      }
    }
    // if (max_calories && min_calories) {
    //   conditions.calories = {
    //     $gte: min_calories,
    //     $lte: max_calories
    //   }
    // }

    if (meal_type !== MealQueryType.All) {
      conditions.meal_type = meal_type
    }

    if (type !== RoleTypeQueryFilter.All) {
      if (type === RoleTypeQueryFilter.System) {
        conditions.user_id = undefined
      } else {
        conditions.user_id = new ObjectId(user_id)
      }
    }

    const [meals, total] = await Promise.all([
      databaseService.meals
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.meals.countDocuments(conditions)
    ])

    return { meals, total }
  }
  async getById({ meal_id, user_id, role }: { meal_id: string; user_id?: string; role: UserRole }) {
    const meal = await databaseService.meals.findOne({
      _id: new ObjectId(meal_id)
    })

    if (!meal) {
      throw new Error(MEALS_MESSAGES.MEAL_NOT_FOUND)
    }

    const result = await databaseService.meals
      .aggregate([
        {
          $match: {
            _id: new ObjectId(meal_id)
          }
        },
        {
          $lookup: {
            from: 'dishes',
            localField: 'dishes',
            foreignField: '_id',
            as: 'dishes'
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
          $project: {
            _id: 1,
            name: 1,
            date: 1,
            description: 1,
            calories: 1,
            pre_time: 1,
            meal_type: 1,
            user_id: 1,
            dishes: 1,
            user: { $arrayElemAt: ['$user', 0] }
          }
        }
      ])
      .toArray()

    // if (
    //   (!meal.user_id && role !== UserRole.Admin) ||
    //   (meal.user_id && role !== UserRole.User) ||
    //   (meal.user_id && role === UserRole.User && meal.user_id.toString() !== user_id)
    // ) {
    //   throw new Error(MEALS_MESSAGES.NO_GET_PERMISSION)
    // }
    return result[0]
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
  async add({ user_id, meal, role }: { user_id?: string; role: UserRole; meal: MealReqBody }) {
    const newMeal = new Meals({
      user_id: role === UserRole.Admin ? undefined : new ObjectId(user_id),
      ...meal
    })
    const mealInserted = await databaseService.meals.insertOne(newMeal)
    // if (user_id) {
    //   await databaseService.users.updateOne(
    //     {
    //       _id: new ObjectId(user_id)
    //     },
    //     {
    //       $push: {
    //         meals: mealInserted.insertedId
    //       }
    //     }
    //   )
    // }
    return {
      ...newMeal,
      _id: mealInserted.insertedId
    }
  }
  async clone({
    user_id,
    meal_ids,
    role,
    date
  }: {
    user_id: string
    role: UserRole
    meal_ids: string[]
    date: string
  }) {
    const meals = await databaseService.meals
      .find({
        _id: {
          $in: meal_ids.map((meal_id) => new ObjectId(meal_id))
        }
      })
      .toArray()
    const newMeals = meals.map((meal: Meals) => {
      return new Meals({
        ...omit(meal, ['_id', 'user_id']),
        user_id: new ObjectId(user_id),
        date: date,
        dishes: meal.dishes.map((item: ObjectId) => item.toString())
      })
    })
    const { insertedIds, insertedCount } = await databaseService.meals.insertMany(newMeals)
    const newMealIds: ObjectId[] = Object.values(insertedIds).map((id) => new ObjectId(id))

    // await databaseService.users.updateOne(
    //   {
    //     _id: new ObjectId(user_id)
    //   },
    //   {
    //     $push: {
    //       meals: { $each: newMealIds }
    //     }
    //   }
    // )
    return newMeals
  }

  async update({
    user_id,
    role,
    meal_id,
    updateMeal
  }: {
    user_id?: string
    role: UserRole
    meal_id?: string
    updateMeal: MealReqBody
  }) {
    const meal = await databaseService.meals.findOne({ _id: new ObjectId(meal_id) })
    if (!meal) {
      throw new Error(MEALS_MESSAGES.MEAL_NOT_FOUND)
    }

    if (
      (!meal.user_id && role !== UserRole.Admin) ||
      (meal.user_id && role !== UserRole.User) ||
      (meal.user_id && role === UserRole.User && meal.user_id.toString() !== user_id)
    ) {
      throw new Error(MEALS_MESSAGES.NO_UPDATE_PERMISSION)
    }

    const temp: any = { ...updateMeal, dishes: updateMeal?.dishes?.map((item) => new ObjectId(item)) }
    if (updateMeal.date) {
      temp.date = new Date(updateMeal.date)
    }
    const result = await databaseService.meals.findOneAndUpdate(
      {
        _id: new ObjectId(meal_id)
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
  async delete({ user_id, role, meal_id }: { user_id?: string; role: UserRole; meal_id?: string }) {
    const meal = await databaseService.meals.findOne({ _id: new ObjectId(meal_id) })
    if (!meal) {
      throw new Error(MEALS_MESSAGES.MEAL_NOT_FOUND)
    }

    if (
      (!meal.user_id && role !== UserRole.Admin) ||
      (meal.user_id && role !== UserRole.User) ||
      (meal.user_id && role === UserRole.User && meal.user_id.toString() !== user_id)
    ) {
      throw new Error(MEALS_MESSAGES.NO_DELETE_PERMISSION)
    }

    // Check điều kiện trước khi xóa
    // Check if meal is part of any health tracking details
    if (meal.isPartOfHealthTrackingDetail) {
      throw new ErrorWithStatus({
        message: MEALS_MESSAGES.MEAL_IS_PART_OF_HEALTH_TRACKING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    //kiểm tra xem meal này có thuộc  challenges nào không
    const health_plan_details = await databaseService.healthPlanDetails
      .find({
        nutrition_details: {
          $elemMatch: {
            meal: new ObjectId(meal_id)
          }
        }
      })
      .toArray()
    if (health_plan_details.length > 0) {
      throw new ErrorWithStatus({
        message: MEALS_MESSAGES.MEAL_IS_PART_OF_CHALLENGE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const [result_1] = await Promise.all([
      await databaseService.meals.deleteOne({
        _id: new ObjectId(meal_id)
      })
    ])

    return result_1
  }
}
const mealService = new MealService()
export default mealService
