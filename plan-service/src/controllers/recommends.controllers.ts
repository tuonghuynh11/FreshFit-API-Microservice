import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RECOMMEND_MESSAGES } from '~/constants/messages'
import { DishRecommendReqBody, DishRecommendReqQuery } from '~/models/requests/Recommend.requests'
import recommendService from '~/services/recommend.services'

export const getDishesRecommendationController = async (
  req: Request<ParamsDictionary, any, DishRecommendReqBody, DishRecommendReqQuery>,
  res: Response
) => {
  const result = await recommendService.getDishRecommend({
    body: req.body,
    query: req.query
  })
  return res.json({
    message: RECOMMEND_MESSAGES.GET_DISHES_RECOMMEND_FOR_USER_SUCCESS,
    result
  })
}
export const getWorkoutPlanRecommendationController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const result = await recommendService.getWorkoutPlanRecommend({
    body: req.body
  })
  return res.json({
    message: RECOMMEND_MESSAGES.GET_WORKOUT_PLANS_RECOMMEND_FOR_USER_SUCCESS,
    result
  })
}
