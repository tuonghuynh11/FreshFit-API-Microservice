import { Router } from 'express'
import {
  addExerciseController,
  deleteExerciseController,
  getAllExerciseController,
  getExerciseByIdController,
  ratingExerciseController,
  searchExercisesController,
  updateExerciseController
} from '~/controllers/exercises.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  addExerciseValidator,
  exercisesSearchValidator,
  updateExerciseValidator
} from '~/middlewares/exercises.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdateExerciseReqBody } from '~/models/requests/Exercise.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /exercises
const exercisesRouter = Router()

/**
 * Description: Search exercise by name
 * Path: ?search = "" &page = 1 &limit = 10 & type = ExerciseCategories & order_by & sort_by
 * Method: GET
 * **/
exercisesRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  exercisesSearchValidator,
  wrapRequestHandler(searchExercisesController)
)

/**
 * Description: Get all exercise
 * Path: /all
 * Method: GET
 * **/
exercisesRouter.get('/all', accessTokenValidator, wrapRequestHandler(getAllExerciseController))

/**
 * Description: Get exercise detail
 * Path: /exercises/:id
 * Method: Get
 * Body:
 * **/
exercisesRouter.get('/:id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(getExerciseByIdController))

/**
 * Description: Add new exercise
 * Path: /exercises
 * Method: Post
 * Body: {
 *  name: string
 *  description: string
 *  category: ExerciseCategories
 *  calories_burn_per_minutes: number
 *  image: string
 *  video: string
 *  target_muscle?: MuscleGroup // nhóm cơ mà bài tập này tác động đến
 *  type?: ExerciseType
 *  equipment?: string // thiết bị cần thiết để thực hiện bài tập này
 *  mechanics?: MechanicsType
 *  forceType?: ForceType // loại lực tác động lên cơ bắp trong bài tập này
 *  experience_level?: LevelType // trình độ người tập cần có để thực hiện bài tập này
 *  secondary_muscle?: MuscleGroup // nhóm cơ phụ mà bài tập này tác động đến
 *  instructions?: string // hướng dẫn thực hiện bài tập này
 *  tips?: string // mẹo thực hiện bài tập này
 * }
 * **/
exercisesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  addExerciseValidator,
  wrapRequestHandler(addExerciseController)
)

/**
 * Description: Update Exercise
 * Path: /exercises/:id
 * Method: Patch
 * Body: {
 *  name: string
 *  description: string
 *  category: ExerciseCategories
 *  calories_burn_per_minutes: number
 *  image: string
 *  video: string
 *  target_muscle?: MuscleGroup // nhóm cơ mà bài tập này tác động đến
 *  type?: ExerciseType
 *  equipment?: string // thiết bị cần thiết để thực hiện bài tập này
 *  mechanics?: MechanicsType
 *  forceType?: ForceType // loại lực tác động lên cơ bắp trong bài tập này
 *  experience_level?: LevelType // trình độ người tập cần có để thực hiện bài tập này
 *  secondary_muscle?: MuscleGroup // nhóm cơ phụ mà bài tập này tác động đến
 *  instructions?: string // hướng dẫn thực hiện bài tập này
 *  tips?: string // mẹo thực hiện bài tập này
 * }
 * **/
exercisesRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  updateExerciseValidator,
  filterMiddleware<UpdateExerciseReqBody>([
    'name',
    'description',
    'category',
    'calories_burn_per_minutes',
    'image',
    'video',
    'target_muscle',
    'type',
    'equipment',
    'mechanics',
    'forceType',
    'experience_level',
    'secondary_muscle',
    'instructions',
    'tips'
  ]),
  wrapRequestHandler(updateExerciseController)
)

/**
 * Description: Delete Exercise
 * Path: /exercises/:id
 * Method: Delete
 * Body:
 * **/
exercisesRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(deleteExerciseController)
)

/**
 * Description: Rating Exercise
 * Path: /:id/rating
 * Method: Post
 * Body: {
 *  value: number
 * }
 * **/
exercisesRouter.post(
  '/:id/rating',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(ratingExerciseController)
)

export default exercisesRouter
