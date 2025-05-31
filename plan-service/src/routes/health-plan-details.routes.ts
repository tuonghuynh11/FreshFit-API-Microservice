import { Router } from 'express'
import {
  addHealthPlanDetailsController,
  addMealForNutritionDetailsController,
  addSetForWorkoutDetailsController,
  deleteHealthPlanDetailController,
  deleteItemInNutritionDetailsController,
  deleteItemInWorkoutDetailsController,
  getAllByHealthPlanIdController,
  getHealthPlanDetailByIdController,
  updateHealthPlanDetailController,
  updateItemStatusInNutritionDetailsController,
  updateOrderNumberOfItemsInNutritionDetailsController,
  updateOrderNumberOfItemsInWorkoutDetailsController,
  updateWorkoutDetailsStatusController
} from '~/controllers/health-plan-details.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  addHealthPlanDetailValidator,
  addMealForNutritionDetailValidator,
  addSetForWorkoutDetailValidator,
  deleteMealForNutritionDetailValidator,
  deleteSetForWorkoutDetailValidator,
  updateHealthPlanDetailValidator
} from '~/middlewares/health-plan-details.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import {
  UpdateHealthPlanDetailReqBody,
  UpdateItemStatusInNutritionDetailsReqBody,
  UpdateOrderNumberInNutritionDetailsReqBody,
  UpdateOrderNumberInWorkoutDetailsReqBody,
  UpdateWorkoutDetailsStatusReqBody
} from '~/models/requests/HealthPlanDetails.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /health-plan-details
const healthPlanDetailsRouter = Router()

/**
 * Description: Get all health plan detail by healthPlanId
 * Path: /all/:healthPlanId?week=1
 * Method: GET
 * **/
healthPlanDetailsRouter.get(
  '/all/:healthPlanId',
  accessTokenValidator,
  wrapRequestHandler(getAllByHealthPlanIdController)
)

/**
 * Description: Get health plan detail
 * Path: /:id
 * Method: Get
 * Body:
 * **/
healthPlanDetailsRouter.get(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getHealthPlanDetailByIdController)
)

/**
 * Description: Add new health plan detail
 * Path: /:healthPlanId
 * Method: Post
 * Body: {
 * workout_details?: WorkoutHealthPlanDetailReqBody[]
 * nutrition_details?: NutritionHealthPlanDetailBody[]
 * name?: string
 * day: number
 * week: number
 * estimated_calories_burned?: number
 * estimated_calories_intake?: number
 * }
 * **/
healthPlanDetailsRouter.post(
  '/:healthPlanId',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  addHealthPlanDetailValidator,
  wrapRequestHandler(addHealthPlanDetailsController)
)

/**
 * Description: Update health plan detail
 * Path: /:id
 * Method: Patch
 * Body: {
 * name?: string
 * day: number
 * week: number
 * estimated_calories_burned?: number
 * estimated_calories_intake?: number
 * status?: GeneralStatus
 * }
 * **/
healthPlanDetailsRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  updateHealthPlanDetailValidator,
  filterMiddleware<UpdateHealthPlanDetailReqBody>([
    'day',
    'week',
    'status',
    'name',
    'estimated_calories_burned',
    'estimated_calories_intake'
  ]),
  wrapRequestHandler(updateHealthPlanDetailController)
)

/**
 * Description: Add set for workout_detail
 * Path: /:id/workout-details
 * Method: Post
 * Body: {
 *    sets: {id:string, orderNumber:number}[] // setId array
 * }
 * **/
healthPlanDetailsRouter.post(
  '/:id/workout-details',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  addSetForWorkoutDetailValidator,
  wrapRequestHandler(addSetForWorkoutDetailsController)
)

/**
 * Description: Update workout_details status
 * Path: /:id/workout-details
 * Method: PUT
 * Body: {
    ids: [] // workout_details ids array,
    status: GeneralStatus
 * }
 * **/
healthPlanDetailsRouter.put(
  '/:id/workout-details-item-status',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  filterMiddleware<UpdateWorkoutDetailsStatusReqBody>(['ids', 'status']),
  wrapRequestHandler(updateWorkoutDetailsStatusController)
)

/**
 * Description: Update orderNumber of items in workout_details
 * Path: /:id/workout-details-item-order-number
 * Method: PUT
 * Body: {
     workout_details: {id:string, orderNumber:number}[] // workout_details array
 * }
 * **/
healthPlanDetailsRouter.put(
  '/:id/workout-details-item-order-number',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  filterMiddleware<UpdateOrderNumberInWorkoutDetailsReqBody>(['workout_details']),
  wrapRequestHandler(updateOrderNumberOfItemsInWorkoutDetailsController)
)

/**
 * Description: Delete item in workout_detail
 * Path: /:id/workout-details
 * Method: Delete
 * Body: {
    ids: []
 * }
 * **/
healthPlanDetailsRouter.delete(
  '/:id/workout-details',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  deleteSetForWorkoutDetailValidator,
  wrapRequestHandler(deleteItemInWorkoutDetailsController)
)

///// Nutrition details
/**
 * Description: Add meal for nutrition_details
 * Path: /:id/nutrition-details
 * Method: Post
 * Body: {
 *    meals: {id:string, orderNumber:number}[]// nutrition_details array
 * }
 * **/
healthPlanDetailsRouter.post(
  '/:id/nutrition-details',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  addMealForNutritionDetailValidator,
  wrapRequestHandler(addMealForNutritionDetailsController)
)

/**
 * Description: Update item status in nutrition_details
 * Path: /:id/nutrition-details-item-status
 * Method: PUT
 * Body: {
    ids: [] // nutrition_details ids array,
    status: GeneralStatus
 * }
 * **/
healthPlanDetailsRouter.put(
  '/:id/nutrition-details-item-status',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  filterMiddleware<UpdateItemStatusInNutritionDetailsReqBody>(['ids', 'status']),
  wrapRequestHandler(updateItemStatusInNutritionDetailsController)
)

/**
 * Description: Update orderNumber of items in nutrition_detail
 * Path: /:id/nutrition-details-item-order-number
 * Method: PUT
 * Body: {
     nutrition_details: {id:string, orderNumber:number}[] // setId array
 * }
 * **/
healthPlanDetailsRouter.put(
  '/:id/nutrition-details-item-order-number',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  filterMiddleware<UpdateOrderNumberInNutritionDetailsReqBody>(['nutrition_details']),
  wrapRequestHandler(updateOrderNumberOfItemsInNutritionDetailsController)
)

/**
 * Description: Delete item in nutrition_detail
 * Path: /:id/nutrition-details
 * Method: Delete
 * Body: {
    ids: []
 * }
 * **/
healthPlanDetailsRouter.delete(
  '/:id/nutrition-details',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  deleteMealForNutritionDetailValidator,
  wrapRequestHandler(deleteItemInNutritionDetailsController)
)

/**
 * Description: Delete health plan detail
 * Path: /:healthPlanId/:id
 * Method: Delete
 * Body:
 * **/
healthPlanDetailsRouter.delete(
  '/:healthPlanId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(deleteHealthPlanDetailController)
)

export default healthPlanDetailsRouter
