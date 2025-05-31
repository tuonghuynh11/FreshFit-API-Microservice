import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { ReportStatus, UserRole } from '~/constants/enums'
import { DISH_MESSAGES, EXERCISE_MESSAGES, REPORT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { DishIngredientReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.requests'
import DishesIngredients from '~/models/schemas/DishesIngredients.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { ReportReqBody } from '~/models/requests/Report.requests'
import Reports from '~/models/schemas/Report.schema'

class ReportService {
  async search({
    search,
    page,
    limit,
    sort_by = 'created_at',
    order_by = 'DESC'
  }: {
    search?: string
    page?: number
    limit?: number
    sort_by: string
    order_by: string
  }) {
    const conditions: any = {}
    if (search) {
      conditions.title = {
        $regex: search,
        $options: 'i'
      }
    }

    const [reports, total] = await Promise.all([
      databaseService.reports
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.reports.countDocuments(conditions)
    ])
    return {
      reports,
      total
    }
  }

  async getById({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const report = await databaseService.reports.findOne({
      _id: new ObjectId(id)
    })
    if (!report) {
      throw new ErrorWithStatus({
        message: REPORT_MESSAGES.REPORT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const reporter = await databaseService.users.findOne(
      {
        _id: report.from
      },
      {
        projection: {
          _id: 1,
          fullName: 1,
          email: 1,
          username: 1,
          avatar: 1,
          verify: 1
        }
      }
    )
    return {
      ...report,
      from: reporter
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

  async add({ user_id, report }: { user_id: string; report: ReportReqBody }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const insertedReport = await databaseService.reports.insertOne(
      new Reports({
        from: new ObjectId(user_id),
        title: report.title,
        message: report.message,
        image: report.image
      })
    )

    const newReport = await databaseService.reports.findOne({
      _id: insertedReport.insertedId
    })
    return newReport
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
  async updateReportStatus({ reportIds, status }: { reportIds: string[]; status: ReportStatus }) {
    const reportIdsTemp = reportIds.map((id) => new ObjectId(id))
    const reports = await databaseService.reports
      .find({
        _id: {
          $in: reportIdsTemp
        }
      })
      .toArray()
    if (reports.length !== reportIds.length) {
      throw new ErrorWithStatus({
        message: REPORT_MESSAGES.SOME_REPORT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.reports.updateMany(
      {
        _id: {
          $in: reportIdsTemp
        }
      },
      {
        $set: {
          status: status
        }
      }
    )
    return true
  }
}
const reportService = new ReportService()
export default reportService
