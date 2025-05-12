import { Router } from 'express'
import {
  addMealController,
  cloneMealController,
  deleteMealController,
  getMealByIdController,
  getMealsByDateController,
  getMealsController,
  updateMealController
} from '~/controllers/meals.controllers'
import { dateValidator } from '~/middlewares/date.middlewares'
import { mealsSearchValidator } from '~/middlewares/meals.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /meals
const mealsRouter = Router()

/**
 * Description: Search meal by name
 * Path: ?search = "" &page = 1 &limit = 10 & type = MealQueryTypeFilter & meal_type = MealQueryType & order_by & sort_by
 * Method: GET
 * **/
mealsRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  mealsSearchValidator,
  wrapRequestHandler(getMealsController)
)

/**
 * Description: Get meal of a day (User)
 * Path: /users
 * Method: GET
 * **/
mealsRouter.get('/users', accessTokenValidator, dateValidator, wrapRequestHandler(getMealsByDateController))

/**
 * Description: Get Meal
 * Path: /meals/:meal_id
 * Method: Get
 * Body:
 * **/
mealsRouter.get('/:meal_id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(getMealByIdController))

/**
 * Description: Add new Meal
 * Path: /meals
 * Method: Post
 * Body: {
 *  name: string
 *  date: Date
 *  description: string
 *  calories: number
 *  pre_time: number
 *  type: MealType
 *  dishes: string[]
 * }
 * **/
mealsRouter.post('/', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(addMealController))
/**
 * Description: Clone a System Meal
 * Path: /meals/clone
 * Method: Post
 * Body: {
 * [Meal_Id]}
 * **/
mealsRouter.post('/clone', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(cloneMealController))

/**
 * Description: Update Meal
 * Path: /meals/:meal_id
 * Method: Put
 * Body: {
 *  name: string
 *  date: Date
 *  description: string
 *  calories: number
 *  pre_time: number
 *  type: MealType
 *  dishes: string[]
 * }
 * **/
mealsRouter.put('/:meal_id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(updateMealController))

/**
 * Description: Delete Meal
 * Path: /meals/:meal_id
 * Method: Delete
 * Body:
 * **/
mealsRouter.delete('/:meal_id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(deleteMealController))

export default mealsRouter
