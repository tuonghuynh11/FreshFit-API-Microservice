import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { GeneralQueryStatusFilter, RoleTypeQueryFilter, UserRole, WorkoutPlanQueryTypeFilter } from '~/constants/enums'
import { WORKOUT_PLAN_MESSAGES } from '~/constants/messages'
import { UpdateWorkoutPlanReqBody, WorkoutPlanReqBody } from '~/models/requests/WorkoutPlan.requests'
import WorkoutPlans from '~/models/schemas/WorkoutPlans.schema'
import { omit } from 'lodash'
import workoutPlanDetailsService from './workout-plan-details.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import WorkoutPlanDetails from '~/models/schemas/WorkoutPlanDetails.schema'
import { envConfig } from '~/constants/config'

class WorkoutPlanService {
  async search({
    search,
    page,
    limit,
    sort_by = 'name',
    order_by = 'ASC',
    type,
    status,
    source,
    user_id,
    role
  }: {
    search?: string
    type: WorkoutPlanQueryTypeFilter
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
        $regex: search,
        $options: 'i'
      }
    }

    if (type !== WorkoutPlanQueryTypeFilter.All) {
      conditions.type = type
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

    const [workoutPlans, total] = await Promise.all([
      databaseService.workoutPlans
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
      workoutPlans,
      total
    }
  }

  async getById({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({
      _id: new ObjectId(id)
    })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (
      (role === UserRole.Admin && workoutPlan?.user_id) ||
      (role === UserRole.User && !workoutPlan?.user_id) ||
      (role === UserRole.User && workoutPlan?.user_id && workoutPlan?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: WORKOUT_PLAN_MESSAGES.NO_GET_PERMISSION })
    }
    return workoutPlan
  }

  async add({ workoutPlan, user_id, role }: { user_id: string; role: UserRole; workoutPlan: WorkoutPlanReqBody }) {
    const newWorkoutPlan = new WorkoutPlans({
      ...omit(workoutPlan, ['details']),
      details: [],
      user_id: role === UserRole.User ? new ObjectId(user_id) : undefined
    })
    const workoutPlanInserted = await databaseService.workoutPlans.insertOne(newWorkoutPlan)

    const workoutPlanDetails = await Promise.all(
      workoutPlan.details.map((workout_plan_detail) =>
        workoutPlanDetailsService.add({
          workout_plan_detail,
          user_id,
          role,
          workoutPlanId: workoutPlanInserted.insertedId.toString()
        })
      )
    )

    await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $push: {
          workout_plans: workoutPlanInserted.insertedId
        }
      }
    )

    return {
      ...newWorkoutPlan,
      details: workoutPlanDetails,
      _id: workoutPlanInserted.insertedId
    }
  }
  async update({
    id,
    updateWorkoutPlan,
    user_id,
    role
  }: {
    id: string
    updateWorkoutPlan: UpdateWorkoutPlanReqBody
    user_id: string
    role: UserRole
  }) {
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(id) })
    if (!workoutPlan) {
      throw new ErrorWithStatus({
        message: WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (
      (role === UserRole.Admin && workoutPlan?.user_id) ||
      (role === UserRole.User && !workoutPlan?.user_id) ||
      (role === UserRole.User && workoutPlan?.user_id && workoutPlan?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: WORKOUT_PLAN_MESSAGES.NO_UPDATE_PERMISSION })
    }
    const result = await databaseService.workoutPlans.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateWorkoutPlan
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
    const workoutPlan = await databaseService.workoutPlans.findOne({ _id: new ObjectId(id) })
    if (!workoutPlan) {
      throw new Error(WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_NOT_FOUND)
    }
    if (
      (role === UserRole.Admin && workoutPlan?.user_id) ||
      (role === UserRole.User && !workoutPlan?.user_id) ||
      (role === UserRole.User && workoutPlan?.user_id && workoutPlan?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: WORKOUT_PLAN_MESSAGES.NO_DELETE_PERMISSION })
    }

    // const isUsedByChallenge = await databaseService.challenges
    //   .find({
    //     workout_plan: {
    //       _id: new ObjectId(id)
    //     }
    //   })
    //   .toArray()

    // if (isUsedByChallenge.length > 0) {
    //   throw new ErrorWithStatus({
    //     status: HTTP_STATUS.BAD_REQUEST,
    //     message: WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_IS_USED
    //   })
    // }

    await Promise.all(
      workoutPlan.details.map((detail: WorkoutPlanDetails) => {
        return workoutPlanDetailsService.delete({ workoutPlanId: id, id: detail._id!.toString() })
      })
    )

    const result = await databaseService.workoutPlans.deleteOne({ _id: new ObjectId(id) })

    if (workoutPlan.user_id) {
      await databaseService.users.updateOne(
        {
          _id: workoutPlan.user_id
        },
        {
          $pull: {
            workout_plans: new ObjectId(id)
          }
        }
      )
    } else {
      await databaseService.users.updateOne(
        {
          email: envConfig.admin_mail
        },
        {
          $pull: {
            workout_plans: new ObjectId(id)
          }
        }
      )
    }

    return result
  }
}
const workoutPlanService = new WorkoutPlanService()
export default workoutPlanService
