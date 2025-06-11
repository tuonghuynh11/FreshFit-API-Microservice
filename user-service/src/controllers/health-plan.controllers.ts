import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { HEALTH_PLAN_MESSAGES } from '~/constants/messages'
import { HealthPlanReqBody, HealthPlanReqQuery, UpdateHealthPlanReqBody } from '~/models/requests/HealthPlans.requests'
import healthPlanService from '~/services/health-plan.services'

export const searchHealthPlansController = async (
  req: Request<ParamsDictionary, any, any, HealthPlanReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { search, page, limit, level, status, sort_by, order_by, source } = req.query
  const { healthPlans, total } = await healthPlanService.search({
    search: search?.toString(),
    level,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    sort_by,
    order_by,
    status,
    source,
    user_id,
    role
  })
  return res.json({
    message: HEALTH_PLAN_MESSAGES.GET_HEALTH_PLAN_SUCCESS,
    result: {
      healthPlans,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addHealthPlanController = async (
  req: Request<ParamsDictionary, any, HealthPlanReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await healthPlanService.add({ user_id, role, healthPlan: req.body })

  return res.json({
    message: HEALTH_PLAN_MESSAGES.ADD_HEALTH_PLAN_SUCCESS,
    health_plan: result
  })
}

export const updateHealthPlanController = async (
  req: Request<ParamsDictionary, any, UpdateHealthPlanReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await healthPlanService.update({ id, updateHealthPlan: req.body, user_id, role })

  return res.json({
    message: HEALTH_PLAN_MESSAGES.UPDATE_HEALTH_PLAN_SUCCESS,
    health_plan: result
  })
}
export const getHealthPlanByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { id } = req.params
  const result = await healthPlanService.getById({ id, user_id, role })

  return res.json({
    message: HEALTH_PLAN_MESSAGES.GET_HEALTH_PLAN_SUCCESS,
    health_plan: result
  })
}

export const deleteHealthPlanController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await healthPlanService.delete({ id, user_id, role })

  return res.json({
    message: HEALTH_PLAN_MESSAGES.DELETE_HEALTH_PLAN_SUCCESS
  })
}
