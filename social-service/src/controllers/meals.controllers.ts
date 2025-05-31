import { Request, Response } from 'express'
import { MealReqBody, MealReqQuery } from '~/models/requests/Meal.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import mealService from '~/services/meals.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { MEALS_MESSAGES } from '~/constants/messages'

export const getMealsController = async (req: Request<ParamsDictionary, any, any, MealReqQuery>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { search, page, limit, meal_type, type, sort_by, order_by, max_calories, min_calories } = req.query
  const { meals, total } = await mealService.getAll({
    search: search?.toString(),
    meal_type,
    type,
    page,
    limit,
    sort_by,
    order_by,
    user_id,
    role,
    max_calories: max_calories ? Number(max_calories) : undefined,
    min_calories: min_calories ? Number(min_calories) : undefined
  })
  return res.json({
    message: MEALS_MESSAGES.GET_MEAL_SUCCESS,
    result: {
      meals,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const getMealsByDateController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { date } = req.query
  const result = await mealService.getMealByDate({
    user_id,
    date
  })

  return res.json({
    message: MEALS_MESSAGES.GET_MEAL_SUCCESS,
    meals: result
  })
}
export const getMealByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const meal_id = req.params.meal_id
  const result = await mealService.getById({ user_id, role, meal_id })

  return res.json({
    message: MEALS_MESSAGES.GET_MEAL_SUCCESS,
    meal: result
  })
}
export const addMealController = async (req: Request<ParamsDictionary, any, MealReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await mealService.add({ user_id, role, meal: req.body })

  return res.json({
    message: MEALS_MESSAGES.ADD_MEAL_SUCCESS,
    meal: result
  })
}
export const cloneMealController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { meal_ids, date } = req.body
  const result = await mealService.clone({ user_id, role, meal_ids, date })

  return res.json({
    message: MEALS_MESSAGES.CLONE_MEAL_SUCCESS,
    meal: result
  })
}
export const updateMealController = async (req: Request<ParamsDictionary, any, MealReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const meal_id = req.params.meal_id
  const result = await mealService.update({ user_id, role, meal_id, updateMeal: req.body })

  return res.json({
    message: MEALS_MESSAGES.UPDATE_MEAL_SUCCESS,
    meal: result
  })
}
export const deleteMealController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const meal_id = req.params.meal_id
  const result = await mealService.delete({ user_id, role, meal_id })

  return res.json({
    message: MEALS_MESSAGES.DELETE_MEAL_SUCCESS
  })
}
