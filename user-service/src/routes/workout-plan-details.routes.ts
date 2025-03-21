import { Router } from 'express'
import {
  addSetForWorkoutPlanDetailsController,
  addWorkoutPlanDetailsController,
  deleteSetInWorkoutPlanDetailsController,
  deleteWorkoutPlanDetailController,
  getWorkoutPlanDetailByIdController,
  searchWorkoutPlanDetailsController,
  updateWorkoutPlanDetailController
} from '~/controllers/workout-plan-details.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import {
  addWorkoutPlanDetailValidator,
  updateWorkoutPlanDetailValidator,
  workoutPlanDetailSearchValidator
} from '~/middlewares/workout-plan-details.middlewares'
import { UpdateWorkoutPlanDetailReqBody } from '~/models/requests/WorkoutPlanDetail.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /workout-plan-details
const workoutPlanDetailsRouter = Router()

/**
 * Description: Search workout plan detail by name
 * Path: /:workoutPlanId?search = "" &page = 1 &limit = 10 & type = ExerciseCategories & order_by & sort_by
 * Method: GET
 * **/
workoutPlanDetailsRouter.get(
  '/:workoutPlanId',
  accessTokenValidator,
  workoutPlanDetailSearchValidator,
  wrapRequestHandler(searchWorkoutPlanDetailsController)
)

/**
 * Description: Get workout plan detail
 * Path: /:workoutPlanId/:id
 * Method: Get
 * Body:
 * **/
workoutPlanDetailsRouter.get(
  '/:workoutPlanId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getWorkoutPlanDetailByIdController)
)

/**
 * Description: Add new workout plan detail
 * Path: /:workoutPlanId
 * Method: Post
 * Body: {
  sets: SetReqBody[]
  day: number
  week: number
 * }
 * **/
workoutPlanDetailsRouter.post(
  '/:workoutPlanId',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  addWorkoutPlanDetailValidator,
  wrapRequestHandler(addWorkoutPlanDetailsController)
)
/**
 * Description: Add set for workout plan detail
 * Path: /:workoutPlanId/:id
 * Method: Post
 * Body: {
    sets: SetReqBody
 * }
 * **/
workoutPlanDetailsRouter.post(
  '/:workoutPlanId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(addSetForWorkoutPlanDetailsController)
)
/**
 * Description: Delete set in workout plan detail
 * Path: /:workoutPlanId/:id/:setId
 * Method: Delete
 * Body: {
    sets: SetReqBody
 * }
 * **/
workoutPlanDetailsRouter.delete(
  '/:workoutPlanId/:id/:setId',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(deleteSetInWorkoutPlanDetailsController)
)

/**
 * Description: Update workout plan detail
 * Path: /:workoutPlanId/:id
 * Method: Patch
 * Body: {
 *  name: string
 *  description: string
 *  category: ExerciseCategories
 *  calories_burn_per_minutes: number
 *  image: string
 *  video: string
 * }
 * **/
workoutPlanDetailsRouter.patch(
  '/:workoutPlanId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  updateWorkoutPlanDetailValidator,
  filterMiddleware<UpdateWorkoutPlanDetailReqBody>(['day', 'week', 'status']),
  wrapRequestHandler(updateWorkoutPlanDetailController)
)

/**
 * Description: Delete workout plan detail
 * Path: /:workoutPlanId/:id
 * Method: Delete
 * Body:
 * **/
workoutPlanDetailsRouter.delete(
  '/:workoutPlanId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(deleteWorkoutPlanDetailController)
)

export default workoutPlanDetailsRouter
