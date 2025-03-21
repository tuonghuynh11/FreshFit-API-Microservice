import { Router } from 'express'
import {
  addDishController,
  addDishIngredientController,
  deleteDishIngredientController,
  getDishByIdController,
  getDishIngredientDetailController,
  ratingDishController,
  searchDishesController,
  updateDishController,
  updateDishIngredientController
} from '~/controllers/dishes.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  addDishIngredientValidator,
  addDishValidator,
  dishesSearchValidator,
  updateDishIngredientValidator,
  updateDishValidator
} from '~/middlewares/dishes.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdateDishIngredientReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /dishes
const dishesRouter = Router()

/**
 * Description: Search dish by name
 * Path: ?search = "" &page = 1 &limit = 10 & order_by & sort_by
 * Method: GET
 * **/
dishesRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  dishesSearchValidator,
  wrapRequestHandler(searchDishesController)
)

/**
 * Description: Ratings
 * Path: /:id/rating
 * Method: GET
 * **/
dishesRouter.post('/:id/rating', accessTokenValidator, wrapRequestHandler(ratingDishController))

/**
 * Description: Get dish detail
 * Path: /:id
 * Method: Get
 * Body:
 * **/
dishesRouter.get('/:id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(getDishByIdController))

/**
 * Description: Add new dish
 * Path: /
 * Method: Post
 * Body: {
 *  name: string
 *  description: string
 *  calories: number
 *  prep_time: number
 *  rating: number
 *  image: string
 *  instruction: string
 *  ingredients: DishesIngredients[]
 * }
 * **/
dishesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  addDishValidator,
  wrapRequestHandler(addDishController)
)

/**
 * Description: Update Dish info
 * Path: /:id
 * Method: Patch
 * Body: {
 *  name: string
 *  description: string
 *  calories: number
 *  prep_time: number
 *  rating: number
 *  image: string
 *  instruction: string
 * }
 * **/
dishesRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  updateDishValidator,
  filterMiddleware<UpdateDishReqBody>([
    'name',
    'description',
    'calories',
    'prep_time',
    'rating',
    'image',
    'instruction'
  ]),
  wrapRequestHandler(updateDishController)
)

/**
 * Description: Add Dish ingredient
 * Path: /ingredients
 * Method: Post
 * Body: {
 *  ingredientId: string
 *  quantity: number
 *  unit: number
 * }
 * **/
dishesRouter.post(
  '/:id/ingredients',
  accessTokenValidator,
  verifiedUSerValidator,
  addDishIngredientValidator,
  wrapRequestHandler(addDishIngredientController)
)
/**
 * Description: Get Dish ingredient Detail
 * Path: /:id/ingredients/:ingredient_id (dishIngredientId)
 * Method: Get
 * **/
dishesRouter.get(
  '/:id/ingredients/:ingredient_id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getDishIngredientDetailController)
)

/**
 * Description: Update Dish ingredient
 * Path: /:id/ingredients/:ingredient_id (dishIngredientId)
 * Method: Patch
 * Body: {
 *  ingredientId: string
 *  quantity: number
 *  unit: number
 * }
 * **/
dishesRouter.patch(
  '/:id/ingredients/:ingredient_id',
  accessTokenValidator,
  verifiedUSerValidator,
  updateDishIngredientValidator,
  filterMiddleware<UpdateDishIngredientReqBody>(['ingredientId', 'quantity', 'unit']),
  wrapRequestHandler(updateDishIngredientController)
)
/**
 * Description: Delete Dish ingredient
 * Path: /:id/ingredients/:ingredient_id (dishIngredientId)
 * Method: Delete
 * **/
dishesRouter.delete(
  '/:id/ingredients/:ingredient_id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteDishIngredientController)
)

export default dishesRouter
