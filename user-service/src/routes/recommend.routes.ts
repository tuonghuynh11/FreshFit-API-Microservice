import { Router } from 'express'
import {
  getDishesRecommendationController,
  getWorkoutPlanRecommendationController
} from '~/controllers/recommends.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /recommends
const recommendsRouter = Router()

/**
 * Description: Get dish recommendations
 * Path: /dishes
 * Method: POST
 * Query: DishRecommendReqQuery
 * Body: DishRecommendReqBody
 * **/
recommendsRouter.post('/dishes', accessTokenValidator, wrapRequestHandler(getDishesRecommendationController))

/**
 * Description: Get workout plan recommendations
 * Path: /workout-plans
 * Method: POST
 * **/
recommendsRouter.post(
  '/workout-plans',
  accessTokenValidator,
  wrapRequestHandler(getWorkoutPlanRecommendationController)
)

export default recommendsRouter
