import { Router } from 'express'
import {
  addDishController,
  addDishIngredientController,
  deleteDishController,
  deleteDishIngredientController,
  getDishByIdController,
  getDishIngredientDetailController,
  ratingDishController,
  searchDishesByIngredientsController,
  searchDishesController,
  updateDishController,
  updateDishIngredientController
} from '~/controllers/dishes.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  addDishIngredientValidator,
  addDishValidator,
  checkOriginalDishValidator,
  dishesSearchByIngredientValidator,
  dishesSearchValidator,
  updateDishIngredientValidator,
  updateDishValidator
} from '~/middlewares/dishes.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdateDishIngredientReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /dishes
const dishesRouter = Router()

/**
 * Description: Search dish by name
 * Path: ?search = "" &page = 1 &limit = 10 & order_by & sort_by & min_calories & max_calories
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
 * Description: Search dish by ingredient name
 * Path: /search-by-ingredient?ingredients = ingredient1|ingredient2 &page = 1 &limit = 10 & order_by & sort_by& min_calories & max_calories
 * Method: GET
 * **/
dishesRouter.get(
  '/search-by-ingredient',
  accessTokenValidator,
  paginationNavigator,
  dishesSearchByIngredientValidator,
  wrapRequestHandler(searchDishesByIngredientsController)
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
 *  fat?: number
 *  saturatedFat?: number
 *  cholesterol?: number
 *  sodium?: number
 *  carbohydrate?: number
 *  fiber?: number
 *  sugar?: number
 *  protein?: number
 *  source_id?: string
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
 *  fat?: number
 *  saturatedFat?: number
 *  cholesterol?: number
 *  sodium?: number
 *  carbohydrate?: number
 *  fiber?: number
 *  sugar?: number
 *  protein?: number
 * }
 * **/
dishesRouter.patch(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  checkOriginalDishValidator,
  updateDishValidator,
  filterMiddleware<UpdateDishReqBody>([
    'name',
    'description',
    'calories',
    'prep_time',
    'rating',
    'image',
    'instruction',
    'fat',
    'saturatedFat',
    'cholesterol',
    'sodium',
    'carbohydrate',
    'fiber',
    'sugar',
    'protein'
  ]),
  wrapRequestHandler(updateDishController)
)

/**
 * Description: Delete dish
 * Path: /dishes/:id
 * Method: Delete
 * Body:
 * **/
dishesRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  checkOriginalDishValidator,
  wrapRequestHandler(deleteDishController)
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
  checkOriginalDishValidator,
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
 *  quantity: string
 *  unit: number
 * }
 * **/
dishesRouter.patch(
  '/:id/ingredients/:ingredient_id',
  accessTokenValidator,
  verifiedUSerValidator,
  checkOriginalDishValidator,
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
  checkOriginalDishValidator,
  wrapRequestHandler(deleteDishIngredientController)
)

export default dishesRouter
