import { Router } from 'express'
import {
  addHealthPlanController,
  deleteHealthPlanController,
  getHealthPlanByIdController,
  searchHealthPlansController,
  updateHealthPlanController
} from '~/controllers/health-plan.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { addHealthPlanValidator, healthPlansSearchValidator } from '~/middlewares/health-plans.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { updateHealthPlanValidator } from '~/middlewares/health-plans.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
import { UpdateHealthPlanReqBody } from '~/models/requests/HealthPlans.requests'
// Base route: /health-plans
const healthPlansRouter = Router()

/**
 * Description: Search health plan by name
 * Path: ?search = "" &page = 1 &limit = 10 & level = WorkoutPlanQueryTypeFilter & order_by & sort_by
 * Method: GET
 * **/
healthPlansRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  healthPlansSearchValidator,
  wrapRequestHandler(searchHealthPlansController)
)

/**
 * Description: Get health plan detail
 * Path: /:id
 * Method: Get
 * Body:
 * **/
healthPlansRouter.get(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getHealthPlanByIdController)
)

/**
 * Description: Add new workout plan
 * Path: /health-plans
 * Method: Post
 * Body: {
 *  user_id?: string
 *  name: string
 *  description: string
 *  estimated_calories_burned?: number
 *  estimated_calories_intake?: number
 *  status?: GeneralStatus
 *  level: WorkoutType
 *  start_date?: Date
 *  end_date?: Date
 * }
 * **/
healthPlansRouter.post(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  addHealthPlanValidator,
  wrapRequestHandler(addHealthPlanController)
)

/**
 * Description: Update health plan
 * Path: /:id
 * Method: Patch
 * Body: {
 *  name: string
 *  description: string
 *  estimated_calories_burned?: number
 *  estimated_calories_intake?: number
 *  status?: GeneralStatus
 *  level: WorkoutType
 *  start_date?: Date
 *  end_date?: Date
 * }
 * **/
healthPlansRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  updateHealthPlanValidator,
  filterMiddleware<UpdateHealthPlanReqBody>([
    'name',
    'description',
    'estimated_calories_burned',
    'estimated_calories_intake',
    'status',
    'level',
    'start_date',
    'end_date'
  ]),
  wrapRequestHandler(updateHealthPlanController)
)

// /**
//  * Description: Delete Health plan
//  * Path: /:id
//  * Method: Delete
//  * Body:
//  * **/
healthPlansRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteHealthPlanController)
)

export default healthPlansRouter
