import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Meals from '~/models/schemas/Meals.schema'
import { MealType } from '~/constants/enums'
import { INGREDIENT_MESSAGES, MEALS_MESSAGES } from '~/constants/messages'
import { IngredientReqBody, UpdateIngredientReqBody } from '~/models/requests/Ingredient.requests'
import Ingredients from '~/models/schemas/Ingredients.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import axios from 'axios'
import OAuth from 'oauth-1.0a'
import CryptoJS from 'crypto-js'
import { envConfig } from '~/constants/config'
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
        $regex: search.trim(),
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

  async searchByThirdPartyFatsecret({ name }: { name: string }) {
    // Tạo OAuth1.0a instance
    const oauth = new OAuth({
      consumer: {
        key: envConfig.fatsecret_consumer_key, // <-- Nhập từ FatSecret
        secret: envConfig.fatsecret_secret_key // <-- Nhập từ FatSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string): string {
        return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64)
      }
    })

    // Không cần access token nếu chỉ dùng app-level access
    const token = undefined
    //---Search Ingredient---//
    // Thông tin request
    const method = 'GET'
    const url = 'https://platform.fatsecret.com/rest/foods/search/v1'
    const params = {
      search_expression: name,
      format: 'json',
      page_number: '0',
      max_results: '1'
    }
    // 👉 Gộp body params và OAuth params
    const oauthParams = oauth.authorize({ url, method, data: params }, token)

    // Kết hợp tất cả vào body (form-encoded)
    // Combine và ép kiểu value về string
    const combinedParams = {
      ...params,
      ...oauthParams
    }

    const formBody = new URLSearchParams(
      Object.entries(combinedParams).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        },
        {} as Record<string, string>
      )
    ).toString()

    // Gửi POST request
    const searchResult = await axios({
      url,
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: formBody
    })
    console.log('Search Result:', searchResult.data)
    const foods = searchResult.data?.foods?.food
    if (foods.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND
      })
    }
    //---Search Ingredient---//

    //---GET Ingredient Detail---//
    // Thông tin request
    const getDetailMethod = 'GET'
    const getDetailUrl = 'https://platform.fatsecret.com/rest/food/v4'
    const getDetailParams = {
      food_id: foods?.food_id,
      format: 'json'
    }
    // 👉 Gộp body params và OAuth params
    const getDetailOauthParams = oauth.authorize(
      { url: getDetailUrl, method: getDetailMethod, data: getDetailParams },
      token
    )

    // Kết hợp tất cả vào body (form-encoded)
    // Combine và ép kiểu value về string
    const getDetailCombinedParams = {
      ...getDetailParams,
      ...getDetailOauthParams
    }

    const getDetailFormBody = new URLSearchParams(
      Object.entries(getDetailCombinedParams).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        },
        {} as Record<string, string>
      )
    ).toString()

    // Gửi POST request
    const getDetailResult = await axios({
      url: getDetailUrl,
      method: getDetailMethod,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: getDetailFormBody
    })
    console.log('Ingredient Detail:', getDetailResult?.data)
    if (!getDetailResult?.data?.food) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND
      })
    }
    //---GET Ingredient Detail---//
    return getDetailResult?.data?.food
  }
}
const ingredientService = new IngredientService()
export default ingredientService
