import { Filter, ObjectId } from 'mongodb'
import databaseService from './database.services'
import { UserRole } from '~/constants/enums'
import { DISH_MESSAGES, EXERCISE_MESSAGES, INGREDIENT_MESSAGES } from '~/constants/messages'
import {
  DishIngredientReqBody,
  DishReqBody,
  UpdateDishIngredientReqBody,
  UpdateDishReqBody
} from '~/models/requests/Dishes.requests'
import Dishes from '~/models/schemas/Dishes.schema'
import DishesIngredients from '~/models/schemas/DishesIngredients.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { omit } from 'lodash'

class DishService {
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

    const [dishes, total] = await Promise.all([
      databaseService.dishes
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.dishes.countDocuments(conditions)
    ])
    return {
      dishes,
      total
    }
  }

  async getById({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const dish = await databaseService.dishes.findOne({
      _id: new ObjectId(id)
    })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (
      (role === UserRole.Admin && dish?.user_id) ||
      (role === UserRole.User && !dish?.user_id) ||
      (role === UserRole.User && dish?.user_id && dish?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: DISH_MESSAGES.NO_GET_PERMISSION })
    }

    const ingredientIds = dish.ingredients.map((item: DishesIngredients) => new ObjectId(item.ingredientId))

    const ingredientDetails = await databaseService.ingredients
      .find({
        _id: {
          $in: ingredientIds
        }
      })
      .toArray()
    const dishIngredients = dish.ingredients.map((item: DishesIngredients, index: number) => {
      return {
        ...omit(item, ['ingredientId']),
        ingredient: ingredientDetails[index]
      }
    })
    return {
      ...dish,
      ingredients: dishIngredients
    }
  }
  async rating({ id, value }: { id: string; value: number }) {
    const dish = await databaseService.dishes.findOne({
      _id: new ObjectId(id)
    })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (dish.user_id != null) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: DISH_MESSAGES.NO_RATING_PERMISSION })
    }
    await databaseService.dishes.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          rating: Number(((dish.rating + value) / 2).toFixed(1))
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async add({ user_id, role, dish }: { user_id: string; role: UserRole; dish: DishReqBody }) {
    const ingredientIds = dish.ingredients.map((ingredient: DishesIngredients) => new ObjectId(ingredient.ingredientId))

    const ingredients = await databaseService.ingredients
      .find({
        _id: {
          $in: ingredientIds
        }
      })
      .toArray()

    if (ingredients.length !== ingredientIds.length) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.SOME_INGREDIENTS_NOT_FOUND,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const newDish = new Dishes({
      ...dish,
      user_id: role === UserRole.User ? new ObjectId(user_id) : undefined,
      ingredients: dish.ingredients.map(
        (ingredient: DishesIngredients) =>
          new DishesIngredients({
            _id: new ObjectId(),
            ingredientId: ingredient.ingredientId.toString(),
            quantity: ingredient.quantity,
            unit: ingredient.unit
          })
      )
    })
    const dishInserted = await databaseService.dishes.insertOne(newDish)

    return {
      ...newDish,
      _id: dishInserted.insertedId
    }
  }
  async update({ id, updateDish }: { id: string; updateDish: UpdateDishReqBody }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.dishes.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateDish
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
    const exercise = await databaseService.exercises.findOne({ _id: new ObjectId(id) })
    if (!exercise) {
      throw new Error(EXERCISE_MESSAGES.EXERCISE_NOT_FOUND)
    }

    const isUsedBySetExercise = await databaseService.set_exercises
      .find({
        exercises: {
          _id: new ObjectId(id)
        }
      })
      .toArray()

    if (isUsedBySetExercise.length > 0) {
      throw new Error(EXERCISE_MESSAGES.EXERCISE_IS_USED)
    }

    const result = await databaseService.exercises.deleteOne({ _id: new ObjectId(id) })

    return result
  }

  async addDishIngredient({ id, dishIngredient }: { id: string; dishIngredient: DishIngredientReqBody }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.dishes.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $push: {
          ingredients: new DishesIngredients({
            _id: new ObjectId(),
            ingredientId: dishIngredient.ingredientId,
            quantity: dishIngredient.quantity,
            unit: dishIngredient.unit
          })
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return result
  }
  async getDishIngredientDetail({ id, ingredient_id }: { id: string; ingredient_id: string }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const ingredient = dish.ingredients.find((ingredient: DishesIngredients) => {
      return ingredient._id!.toString() === ingredient_id
    })

    if (!ingredient) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const ingredientsDetail = await databaseService.ingredients.findOne({
      _id: new ObjectId(ingredient.ingredientId)
    })
    return {
      ...omit(ingredient, ['ingredientId']),
      ingredient: ingredientsDetail
    }
  }
  async updateDishIngredient({
    id,
    ingredient_id,
    updateDishIngredient
  }: {
    id: string
    ingredient_id: string
    updateDishIngredient: UpdateDishIngredientReqBody
  }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let index = -1
    const ingredient = dish.ingredients.find((ingredient: DishesIngredients, i: number) => {
      index = i
      return ingredient._id!.toString() === ingredient_id
    })

    if (!ingredient) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const temp: any = updateDishIngredient
    if (updateDishIngredient?.ingredientId) {
      temp.ingredientId = new ObjectId(updateDishIngredient.ingredientId)
    }

    dish.ingredients[index] = {
      ...ingredient,
      ...temp,
      updated_at: new Date()
    }

    const result = await databaseService.dishes.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...dish,
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return result
  }
  async deleteDishIngredient({ id, ingredient_id }: { id: string; ingredient_id: string }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const ingredient = dish.ingredients.find((ingredient: DishesIngredients) => {
      return ingredient._id!.toString() === ingredient_id
    })

    if (!ingredient) {
      throw new ErrorWithStatus({
        message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.dishes.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $pull: {
          ingredients: {
            _id: new ObjectId(ingredient_id)
          }
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return result
  }

  async searchByIngredients({
    ingredients,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC'
  }: {
    ingredients: string
    page?: number
    limit?: number
    sort_by: string
    order_by: string
  }) {
    const ingredientNames = ingredients.split('|').map((ingredient) => ingredient.trim())
    const ingredientList = await databaseService.ingredients
      .find({
        $or: ingredientNames.map((ingredient) => ({ name: { $regex: ingredient, $options: 'i' } }))
      })
      .toArray()

    const ingredientIds = ingredientList.map((ingredient) => new ObjectId(ingredient._id))

    // Nếu không tìm thấy thành phần, trả về rỗng
    if (!ingredientIds.length) {
      return {
        dishes: [],
        total: 0
      }
    }

    const conditions: Filter<Dishes> = {
      ingredients: {
        $elemMatch: {
          ingredientId: {
            $in: ingredientIds
          }
        }
      }
    }

    // Aggregation pipeline để tìm và sắp xếp món ăn theo số lượng thành phần khớp
    const dishesPipeline = [
      // Lọc các món ăn có ít nhất một thành phần trong ingredientIds
      {
        $match: conditions
      },
      // Thêm trường matchedIngredientsCount để đếm số lượng thành phần khớp
      {
        $addFields: {
          matchedIngredientsCount: {
            $size: {
              $filter: {
                input: '$ingredients',
                as: 'ingredient',
                cond: { $in: ['$$ingredient.ingredientId', ingredientIds] }
              }
            }
          }
        }
      },
      // Lookup để lấy thông tin từ collection Ingredients
      {
        $lookup: {
          from: 'ingredients', // Tên collection Ingredients
          localField: 'ingredients.ingredientId', // Trường trong Dishes
          foreignField: '_id', // Trường trong Ingredients
          as: 'ingredientDetails' // Tên mảng chứa kết quả lookup
        }
      },
      // Cập nhật mảng ingredients để thêm trường name
      {
        $set: {
          ingredients: {
            $map: {
              input: '$ingredients',
              as: 'ingredient',
              in: {
                $mergeObjects: [
                  '$$ingredient',
                  {
                    name: {
                      $arrayElemAt: [
                        '$ingredientDetails.name',
                        {
                          $indexOfArray: ['$ingredientDetails._id', '$$ingredient.ingredientId']
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // Loại bỏ mảng ingredientDetails tạm thời
      {
        $unset: 'ingredientDetails'
      },
      {
        $sort: {
          matchedIngredientsCount: -1, // Sắp xếp theo số lượng thành phần khớp giảm dần
          [sort_by]: order_by === 'ASC' ? 1 : -1 // Sắp xếp thứ tự theo sort_by
        }
      },
      // Phân trang
      ...(page && limit ? [{ $skip: (page - 1) * limit }, { $limit: limit }] : [])
    ]

    const [dishes, total] = await Promise.all([
      databaseService.dishes.aggregate(dishesPipeline).toArray(),
      await databaseService.dishes.countDocuments(conditions)
    ])
    return {
      dishes,
      total
    }
  }
}
const dishService = new DishService()
export default dishService
