import { Router } from 'express'
import {
  addWorkoutPlanController,
  getWorkoutPlanByIdController,
  searchWorkoutPlansController,
  updateWorkoutPlanController
} from '~/controllers/workout-plans.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import {
  addWorkoutPlanValidator,
  updateWorkoutPlanValidator,
  workoutPlansSearchValidator
} from '~/middlewares/workout-plans.middlewares'
import { UpdateWorkoutPlanReqBody } from '~/models/requests/WorkoutPlan.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /workout-plans
const workoutPlansRouter = Router()

/**
 * Description: Search workout plan by name
 * Path: ?search = "" &page = 1 &limit = 10 & type = ExerciseCategories & order_by & sort_by
 * Method: GET
 * **/
workoutPlansRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  workoutPlansSearchValidator,
  wrapRequestHandler(searchWorkoutPlansController)
)

/**
 * Description: Get workout plan detail
 * Path: /:id
 * Method: Get
 * Body:
 * **/
workoutPlansRouter.get(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getWorkoutPlanByIdController)
)

/**
 * Description: Add new workout plan
 * Path: /workout-plans
 * Method: Post
 * Body: {
 *  name: string
 *  description: string
 *  number_of_set: number
 *  estimated_calories_burned: number
 *  type: WorkoutType
 *  start_date?: Date
 *  end_date?: Date
 *  details: WorkoutPlanDetailBody[]
 * }
 * **/
workoutPlansRouter.post(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  addWorkoutPlanValidator,
  wrapRequestHandler(addWorkoutPlanController)
)

/**
 * Description: Update workout plan
 * Path: /:id
 * Method: Patch
 * Body: {
 *  name: string
 *  description: string
 *  number_of_set: number
 *  estimated_calories_burned: number
 *  type: WorkoutType
 *  start_date?: Date
 *  end_date?: Date
 *  status: GeneralStatus
 * }
 * **/
workoutPlansRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  updateWorkoutPlanValidator,
  filterMiddleware<UpdateWorkoutPlanReqBody>([
    'name',
    'description',
    'number_of_set',
    'estimated_calories_burned',
    'type',
    'start_date',
    'end_date',
    'status'
  ]),
  wrapRequestHandler(updateWorkoutPlanController)
)

// /**
//  * Description: Delete Exercise
//  * Path: /:id
//  * Method: Delete
//  * Body:
//  * **/
// workoutPlansRouter.delete(
//   '/:id',
//   accessTokenValidator,
//   verifiedUSerValidator,
//   wrapRequestHandler(deleteWorkoutPlanController)
// )

export default workoutPlansRouter
