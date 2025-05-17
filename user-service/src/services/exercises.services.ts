import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Meals from '~/models/schemas/Meals.schema'
import { ExerciseType, LevelType, MealType } from '~/constants/enums'
import { EXERCISE_MESSAGES, MEALS_MESSAGES } from '~/constants/messages'
import { ExerciseReqBody, UpdateExerciseReqBody } from '~/models/requests/Exercise.requests'
import Exercises from '~/models/schemas/Exercises.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MUSCLE_GROUP_NAME } from '~/constants'

class ExerciseService {
  async search({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    type,
    target_muscle,
    experience_level
  }: {
    search?: string
    type: ExerciseType
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    target_muscle?: MUSCLE_GROUP_NAME
    experience_level: LevelType
  }) {
    const conditions: any = {}
    if (search) {
      conditions.name = {
        $regex: search,
        $options: 'i'
      }
    }

    if (type) {
      conditions.type = type
    }
    if (target_muscle) {
      conditions['target_muscle.name'] = target_muscle
    }
    if (experience_level) {
      conditions.experience_level = experience_level
    }
    const [exercises, total] = await Promise.all([
      databaseService.exercises
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.exercises.countDocuments(conditions)
    ])
    return {
      exercises,
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
    const exercise = await databaseService.exercises.findOne({
      _id: new ObjectId(id)
    })
    if (!exercise) {
      throw new Error(EXERCISE_MESSAGES.EXERCISE_NOT_FOUND)
    }
    return exercise
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
  async add({ exercise }: { exercise: ExerciseReqBody }) {
    const newExercise = new Exercises({
      ...exercise
    })
    const exerciseInserted = await databaseService.exercises.insertOne(newExercise)

    return {
      ...newExercise,
      _id: exerciseInserted.insertedId
    }
  }
  async update({ id, updateExercise }: { id: string; updateExercise: UpdateExerciseReqBody }) {
    const exercise = await databaseService.exercises.findOne({ _id: new ObjectId(id) })
    if (!exercise) {
      throw new Error(EXERCISE_MESSAGES.EXERCISE_NOT_FOUND)
    }
    const result = await databaseService.exercises.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateExercise
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
  async rating({ id, value }: { id: string; value: number }) {
    const exercise = await databaseService.exercises.findOne({
      _id: new ObjectId(id)
    })
    if (!exercise) {
      throw new ErrorWithStatus({
        message: EXERCISE_MESSAGES.EXERCISE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    await databaseService.exercises.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          rating: Number(((exercise!.rating! + value) / 2).toFixed(1))
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
}
const exerciseService = new ExerciseService()
export default exerciseService
