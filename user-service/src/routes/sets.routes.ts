import { Router } from 'express'
import {
  addSetController,
  cloneSetController,
  deleteSetsController,
  getSetByIdController,
  ratingSetController,
  searchSetsController,
  updateSetController
} from '~/controllers/sets.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { addSetValidator, setsSearchValidator, updateSetValidator } from '~/middlewares/sets.middlwates'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdateSetReqBody } from '~/models/requests/Set.requests'
import { wrapRequestHandler } from '~/utils/handles'
const setsRouter = Router()
// Base route: /sets
/**
 * Description: Search set by name
 * Path: ?search = "" &page = 1 &limit = 10 & order_by & sort_by & min_calories & max_calories & level
 * Method: GET
 * **/
setsRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  setsSearchValidator,
  wrapRequestHandler(searchSetsController)
)
/**
 * Description: Get set detail
 * Path: /sets/:id
 * Method: Get
 * Body:
 * **/
setsRouter.get('/:id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(getSetByIdController))

/**
 * Description: Add new set
 * Path: /sets
 * Method: Post
 * Body: {
    name: string
    type: SetType
    description: string
    user_id?: ObjectId
    number_of_exercise: number
    status?: SetStatus
    rating: number
    created_at?: Date
    updated_at?: Date
    set_exercises: SetExercises[]
    time?: string
    image?: string
    total_calories?: number
    is_youtube_workout?: boolean // true nếu là youtube workout, false nếu là set bài tập bình thường
    youtube_id?: string
 * }
 * **/
setsRouter.post('/', accessTokenValidator, verifiedUSerValidator, addSetValidator, wrapRequestHandler(addSetController))
/**
 * Description: Rating set
 * Path: /:id/rating
 * Method: Post
 * Body:
 * **/
setsRouter.post('/:id/rating', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(ratingSetController))

/**
 * Description: Update set
 * Path: /sets/:id
 * Method: patch
 * Body: {
    name: string
    type: SetType
    description: string
    number_of_exercises: number
    set_exercises: SetExerciseReqBody[],
    status: SetStatus
    time: string // 2 hour, 30 minutes
    image: string
    total_calories: number
    rating: number
    is_youtube_workout?: boolean // true nếu là youtube workout, false nếu là set bài tập bình thường
    youtube_id?: string
 * }
 * **/
setsRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  updateSetValidator,
  filterMiddleware<UpdateSetReqBody>([
    'name',
    'type',
    'description',
    'number_of_exercises',
    'set_exercises',
    'status',
    'time',
    'image',
    'total_calories',
    'is_youtube_workout',
    'youtube_id',
    'rating'
  ]),
  wrapRequestHandler(updateSetController)
)

/**
 * Description: Delete set
 * Path: /sets/:id
 * Method: Delete
 * Body:
 * **/
setsRouter.delete('/:id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(deleteSetsController))

/**
 * Description: Clone a System set
 * Path: /clone
 * Method: Post
 * Body: [set_Id]
 * **/
setsRouter.post('/clone', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(cloneSetController))
export default setsRouter
