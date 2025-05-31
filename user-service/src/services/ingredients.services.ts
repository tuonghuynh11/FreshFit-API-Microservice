import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Meals from '~/models/schemas/Meals.schema'
import { MealType } from '~/constants/enums'
import { INGREDIENT_MESSAGES, MEALS_MESSAGES } from '~/constants/messages'
import { IngredientReqBody, UpdateIngredientReqBody } from '~/models/requests/Ingredient.requests'
import Ingredients from '~/models/schemas/Ingredients.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

class IngredientService {
  async search({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC'
  }: {
    search?: string
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

    const [ingredients, total] = await Promise.all([
      databaseService.ingredients
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          },
          projection: {
            created_at: 0,
            updated_at: 0
          }
        })
        .toArray(),
      await databaseService.ingredients.countDocuments(conditions)
    ])
    return {
      ingredients,
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
    const ingredient = await databaseService.ingredients.findOne({
      _id: new ObjectId(id)
    })
    if (!ingredient) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return ingredient
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
  async add({ ingredient }: { ingredient: IngredientReqBody }) {
    const newIngredient = new Ingredients({
      ...ingredient
    })
    const ingredientInserted = await databaseService.ingredients.insertOne(newIngredient)

    return {
      ...newIngredient,
      _id: ingredientInserted.insertedId
    }
  }
  async update({ id, updateIngredient }: { id: string; updateIngredient: UpdateIngredientReqBody }) {
    const ingredient = await databaseService.ingredients.findOne({ _id: new ObjectId(id) })
    if (!ingredient) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.ingredients.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateIngredient
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
  async delete({ id }: { id: string }) {
    const ingredient = await databaseService.ingredients.findOne({ _id: new ObjectId(id) })
    if (!ingredient) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isUsedByDishes = await databaseService.dishes
      .find({
        ingredients: {
          $elemMatch: {
            ingredient: {
              _id: new ObjectId(id)
            }
          }
        }
      })
      .toArray()

    if (isUsedByDishes.length > 0) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_IS_USED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const result = await databaseService.ingredients.deleteOne({ _id: new ObjectId(id) })

    return result
  }
}
const ingredientService = new IngredientService()
export default ingredientService
