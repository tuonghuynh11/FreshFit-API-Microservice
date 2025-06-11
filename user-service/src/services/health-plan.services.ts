import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { GeneralQueryStatusFilter, RoleTypeQueryFilter, UserRole, WorkoutPlanQueryTypeFilter } from '~/constants/enums'
import { HEALTH_PLAN_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { HealthPlanReqBody, UpdateHealthPlanReqBody } from '~/models/requests/HealthPlans.requests'
import HealthPlans from '~/models/schemas/HealthPlans.schema'

class HealthPlanService {
  async search({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    level,
    status,
    source,
    user_id,
    role
  }: {
    search?: string
    level: WorkoutPlanQueryTypeFilter
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    status: GeneralQueryStatusFilter
    source: RoleTypeQueryFilter
    user_id: string
    role: UserRole
  }) {
    const conditions: any = {}
    if (search) {
      conditions.name = {
        $regex: search.trim(),
        $options: 'i'
      }
    }

    if (level !== WorkoutPlanQueryTypeFilter.All) {
      conditions.level = level
    }

    if (status !== GeneralQueryStatusFilter.All) {
      conditions.status = status
    }

    if (source !== RoleTypeQueryFilter.All) {
      if (source === RoleTypeQueryFilter.System) {
        conditions.user_id = undefined
      } else {
        conditions.user_id = new ObjectId(user_id)
      }
    }

    const [healthPlans, total] = await Promise.all([
      databaseService.healthPlans
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.healthPlans.countDocuments(conditions)
    ])
    return {
      healthPlans,
      total
    }
  }

  async getById({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const workoutPlan = await databaseService.healthPlans.findOne({
      _id: new ObjectId(id)
    })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (
      (role === UserRole.Admin && workoutPlan?.user_id) ||
      (role === UserRole.User && !workoutPlan?.user_id) ||
      (role === UserRole.User && workoutPlan?.user_id && workoutPlan?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: HEALTH_PLAN_MESSAGES.NO_GET_PERMISSION })
    }

    const result = await databaseService.healthPlans
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
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
          $lookup: {
            from: 'health_plan_details',
            localField: 'details',
            foreignField: '_id',
            as: 'details'
          }
        }
      ])
      .toArray()
    result[0].details = result[0].details.sort((a: any, b: any) => a < b)
    return result[0]
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
  async update({
    id,
    updateHealthPlan,
    user_id,
    role
  }: {
    id: string
    updateHealthPlan: UpdateHealthPlanReqBody
    user_id: string
    role: UserRole
  }) {
    const healthPlan = await databaseService.healthPlans.findOne({ _id: new ObjectId(id) })
    if (!healthPlan) {
      throw new ErrorWithStatus({
        message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (
      (role === UserRole.Admin && healthPlan?.user_id) ||
      (role === UserRole.User && !healthPlan?.user_id) ||
      (role === UserRole.User && healthPlan?.user_id && healthPlan?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: HEALTH_PLAN_MESSAGES.NO_UPDATE_PERMISSION })
    }
    const result = await databaseService.healthPlans.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateHealthPlan
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
  async delete({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const healthPlan = await databaseService.healthPlans.findOne({ _id: new ObjectId(id) })
    if (!healthPlan) {
      throw new Error(HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NOT_FOUND)
    }
    if (
      (role === UserRole.Admin && healthPlan?.user_id) ||
      (role === UserRole.User && !healthPlan?.user_id) ||
      (role === UserRole.User && healthPlan?.user_id && healthPlan?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: HEALTH_PLAN_MESSAGES.NO_DELETE_PERMISSION })
    }

    // Xóa các chi tiết liên quan đến health plan
    await databaseService.healthPlanDetails.deleteMany({
      _id: { $in: healthPlan.details }
    })

    const result = await databaseService.healthPlans.deleteOne({ _id: new ObjectId(id) })

    return result
  }
}
const healthPlanService = new HealthPlanService()
export default healthPlanService
