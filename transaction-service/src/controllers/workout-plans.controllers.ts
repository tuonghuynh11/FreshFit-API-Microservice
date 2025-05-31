import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { WORKOUT_PLAN_MESSAGES } from '~/constants/messages'
import {
  UpdateWorkoutPlanReqBody,
  WorkoutPlanReqBody,
  WorkoutPlanReqQuery
} from '~/models/requests/WorkoutPlan.requests'
import workoutPlanService from '~/services/workout-plans.services'

export const searchWorkoutPlansController = async (
  req: Request<ParamsDictionary, any, any, WorkoutPlanReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { search, page, limit, type, status, sort_by, order_by, source } = req.query
  const { workoutPlans, total } = await workoutPlanService.search({
    search: search?.toString(),
    type,
    page,
    limit,
    sort_by,
    order_by,
    status,
    source,
    user_id,
    role
  })
  return res.json({
    message: WORKOUT_PLAN_MESSAGES.GET_WORKOUT_PLAN_SUCCESS,
    result: {
      workoutPlans,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addWorkoutPlanController = async (
  req: Request<ParamsDictionary, any, WorkoutPlanReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await workoutPlanService.add({ user_id, role, workoutPlan: req.body })

  return res.json({
    message: WORKOUT_PLAN_MESSAGES.ADD_WORKOUT_PLAN_SUCCESS,
    workout_plan: result
  })
}

export const updateWorkoutPlanController = async (
  req: Request<ParamsDictionary, any, UpdateWorkoutPlanReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await workoutPlanService.update({ id, updateWorkoutPlan: req.body, user_id, role })

  return res.json({
    message: WORKOUT_PLAN_MESSAGES.UPDATE_WORKOUT_PLAN_SUCCESS,
    workout_plan: result
  })
}
export const getWorkoutPlanByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { id } = req.params
  const result = await workoutPlanService.getById({ id, user_id, role })

  return res.json({
    message: WORKOUT_PLAN_MESSAGES.GET_WORKOUT_PLAN_SUCCESS,
    workout_plan: result
  })
}

export const deleteWorkoutPlanController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await workoutPlanService.delete({ id, user_id, role })

  return res.json({
    message: WORKOUT_PLAN_MESSAGES.DELETE_WORKOUT_PLAN_SUCCESS
  })
}
