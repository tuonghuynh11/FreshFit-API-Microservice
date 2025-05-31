import { Router } from 'express'
import {
  addHealthTrackingController,
  addHealthTrackingDetailController,
  addHealthTrackingDetailForMealController,
  addWaterActivityController,
  createDailyHealthSummaryController,
  deleteDishesInHealthTrackingDetailForMealController,
  deleteHealthTrackingDetailController,
  getDailyHealthSummaryController,
  getHealthTrackingController,
  getHealthTrackingMoreDetailController,
  updateHealthTrackingController,
  updateHealthTrackingDetailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  createDailyHealthSummaryValidator,
  verifiedUSerValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /healths
const healthRouter = Router()

/**
 * Description: View Health Activity
 * Path: /health-tracking
 * Method: Get
 * Query:
 * {
 *  type:number; (all, water, consumed, burned),
 *  getBy: string; (day, week, month, year),
 *  date: string; (2021-09-01)
 * }
 * **/
healthRouter.get(
  '/health-tracking',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getHealthTrackingController)
)
/**
 * Description: Add Health Activity
 * Path: /health-tracking
 * Method: Post
 * Body: {
 *HealthTrackingBody
 * }
 * **/
healthRouter.post(
  '/health-tracking',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addHealthTrackingController)
)
/**
 * Description: Get Health Tracking By Id
 * Path: /health-tracking/:id
 * Method: GET
 * Body: {
 * }
 * **/
healthRouter.get(
  '/health-tracking/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getHealthTrackingMoreDetailController)
)

/**
 * Description: Update Health Activity
 * Path: /health-tracking/:id
 * Method: Patch
 * Body: {
 *UpdateHealthTrackingBody
 * }
 * **/
healthRouter.patch(
  '/health-tracking/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(updateHealthTrackingController)
)

/**
 * Description: Add Health Tracking Detail (Use for workout, dish, exercise)
 * Path: /health-tracking-details
 * Method: Post
 * Body: {
 *HealthTrackingDetailBody
 * }
 * **/
healthRouter.post(
  '/health-tracking-details',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addHealthTrackingDetailController)
)

/**
 * Description: Add Health Tracking Detail (For meal)
 * Path: /health-tracking-details/meals
 * Method: Post
 * Body: {
 *   mealType: MealType,
 *   dishIds: string[],
 * }
 * **/
healthRouter.post(
  '/health-tracking-details/meals',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addHealthTrackingDetailForMealController)
)
/**
 * Description: Delete dish in Health Tracking Detail (For meal)
 * Path: /health-tracking/:healthTrackingId/health-tracking-details/:id/dishes
 * Method: Delete
 * Body: {
 *   dishIds: string[],
 * }
 * **/
healthRouter.delete(
  '/health-tracking/:healthTrackingId/health-tracking-details/:id/dishes',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteDishesInHealthTrackingDetailForMealController)
)

/**
 * Description: Update Health Tracking Detail
 * Path: /health-tracking/:healthTrackingId/health-tracking-details/:id
 * Method: Patch
 * Body: {
 * status: GeneralStatus
 *  actual_finish_time: number // thời gian thực tế hoàn thành bài tập
 * }
 * **/
healthRouter.patch(
  '/health-tracking/:healthTrackingId/health-tracking-details/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(updateHealthTrackingDetailController)
)
/**
 * Description: Delete Health Tracking Detail
 * Path: /health-tracking/:healthTrackingId/health-tracking-details/:id
 * Method: Delete
 * Body: {

 * }
 * **/
healthRouter.delete(
  '/health-tracking/:healthTrackingId/health-tracking-details/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteHealthTrackingDetailController)
)

/**
 * Description: Add Water Activity
 * Path: /waters
 * Method: Post
 * Body: {
 *  date: Date
 *  goal: number
 *  step: number
 * }
 * **/
healthRouter.post(
  '/waters',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addWaterActivityController)
)

/**
 * Description: Create Summary Daily Health Information
 * Path: /daily-health-summary
 * Method: Post
 * Body: {
 *  heartRate: number,
 *  bloodPressure: { systolic: number, diastolic: number },
 *  sleep: { duration: number, quality: SleepQuality },
 *  caloriesBurned: number,
 *  caloriesConsumed: number,
 *  waterIntake: number,
 *  date: Date
 * }
 * **/

healthRouter.post(
  '/daily-health-summary',
  accessTokenValidator,
  verifiedUSerValidator,
  createDailyHealthSummaryValidator,
  wrapRequestHandler(createDailyHealthSummaryController)
)
/**
 * Description: Get Summary Daily Health Information
 * Path: /daily-health-summary
 * Method: Get
 * Body: {}
 * Query:
 * {
 *  getBy: string; (day, week, month, year),
 *  date: string; (2021-09-01)
 * }
 * **/

healthRouter.get(
  '/daily-health-summary',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getDailyHealthSummaryController)
)

export default healthRouter
