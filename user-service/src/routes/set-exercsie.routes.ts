import { Router } from 'express'
import {
  addSetExerciseController,
  deleteSetsExerciseController,
  getSetExerciseByIdController,
  updateSetExerciseController
} from '~/controllers/set-exercises.controllers'
import { searchSetsController } from '~/controllers/sets.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { addSetExerciseValidator, updateSetExerciseValidator } from '~/middlewares/set-exercises.middleware'
import { setsSearchValidator } from '~/middlewares/sets.middlwates'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdateSetExerciseReqBody } from '~/models/requests/SetExercise.requests'
import { wrapRequestHandler } from '~/utils/handles'
const setsExerciseRouter = Router()
// Base route: /sets-exercise
/**
 * Description: Search set by name
 * Path: ?search = "" &page = 1 &limit = 10 & order_by & sort_by
 * Method: GET
 * **/
setsExerciseRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  setsSearchValidator,
  wrapRequestHandler(searchSetsController)
)
/**
 * Description: Get set exercise detail
 * Path: /:setId/:id
 * Method: Get
 * Body:
 * **/
setsExerciseRouter.get(
  '/:setId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getSetExerciseByIdController)
)

/**
 * Description: Add new set exercise
 * Path: /sets-exercise/:setId
 * Method: Post
 * Body: {
    exercise_id: string
    duration: number
    reps: number
    round: number
    rest_per_round: number
    estimated_calories_burned: number
 * }
 * **/
setsExerciseRouter.post(
  '/:setId',
  accessTokenValidator,
  verifiedUSerValidator,
  addSetExerciseValidator,
  wrapRequestHandler(addSetExerciseController)
)

/**
 * Description: Update new set exercise
 * Path: /:setId/:id
 * Method: Patch
 * Body: {
    exercise_id: string
    duration: number
    reps: number
    round: number
    rest_per_round: number
    estimated_calories_burned: number
 * }
 * **/
setsExerciseRouter.patch(
  '/:setId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  updateSetExerciseValidator,
  filterMiddleware<UpdateSetExerciseReqBody>([
    'exercise_id',
    'duration',
    'reps',
    'round',
    'rest_per_round',
    'estimated_calories_burned',
    'status'
  ]),
  wrapRequestHandler(updateSetExerciseController)
)

/**
 * Description: Delete set exercise
 * Path: /:setId/:id
 * Method: Delete
 * Body:
 * **/
setsExerciseRouter.delete(
  '/:setId/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteSetsExerciseController)
)

export default setsExerciseRouter
