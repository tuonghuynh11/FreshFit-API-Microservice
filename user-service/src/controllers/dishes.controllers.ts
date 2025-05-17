import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { DISH_INGREDIENT_MESSAGES, DISH_MESSAGES, EXERCISE_MESSAGES } from '~/constants/messages'
import exerciseService from '~/services/exercises.services'
import {
  DishIngredientReqBody,
  DishReqBody,
  DishReqQuery,
  SearchDishByIngredientReqQuery,
  UpdateDishIngredientReqBody,
  UpdateDishReqBody
} from '~/models/requests/Dishes.requests'
import dishService from '~/services/dishes.services'

export const searchDishesController = async (req: Request<ParamsDictionary, any, any, DishReqQuery>, res: Response) => {
  const { search, page, limit, sort_by, order_by, max_calories, min_calories } = req.query
  const { dishes, total } = await dishService.search({
    search: search?.toString(),
    page: Number(page),
    limit: Number(limit),
    sort_by,
    order_by,
    max_calories: max_calories ? Number(max_calories) : undefined,
    min_calories: min_calories ? Number(min_calories) : undefined
  })
  return res.json({
    message: DISH_MESSAGES.GET_DISH_SUCCESS,
    result: {
      dishes,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addDishController = async (req: Request<ParamsDictionary, any, DishReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await dishService.add({ user_id, role, dish: req.body })

  return res.json({
    message: DISH_MESSAGES.ADD_DISH_SUCCESS,
    dish: result
  })
}

export const updateDishController = async (req: Request<ParamsDictionary, any, UpdateDishReqBody>, res: Response) => {
  const { id } = req.params
  const result = await dishService.update({ id, updateDish: req.body })

  return res.json({
    message: DISH_MESSAGES.UPDATE_DISH_SUCCESS,
    dishService: result
  })
}

export const ratingDishController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const { value } = req.body
  const result = await dishService.rating({ id, value: Number(value) })

  return res.json({
    message: DISH_MESSAGES.RATING_SUCCESS
  })
}
export const getDishByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await dishService.getById({ id, user_id, role })

  return res.json({
    message: DISH_MESSAGES.GET_DISH_SUCCESS,
    dish: result
  })
}
export const getAllExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const result = await exerciseService.getAll()

  return res.json({
    message: EXERCISE_MESSAGES.GET_ALL_EXERCISE_SUCCESS,
    exercises: result
  })
}

export const deleteExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await exerciseService.delete({ id })

  return res.json({
    message: EXERCISE_MESSAGES.DELETE_EXERCISE_SUCCESS
  })
}

export const addDishIngredientController = async (
  req: Request<ParamsDictionary, any, DishIngredientReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params

  const result = await dishService.addDishIngredient({ id, dishIngredient: req.body })

  return res.json({
    message: DISH_INGREDIENT_MESSAGES.ADD_DISH_INGREDIENT_SUCCESS,
    dish: result
  })
}
export const getDishIngredientDetailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id, ingredient_id } = req.params

  const result = await dishService.getDishIngredientDetail({ id, ingredient_id })

  return res.json({
    message: DISH_INGREDIENT_MESSAGES.GET_DISH_INGREDIENT_SUCCESS,
    dish_ingredient: result
  })
}
export const updateDishIngredientController = async (
  req: Request<ParamsDictionary, any, UpdateDishIngredientReqBody>,
  res: Response
) => {
  const { id, ingredient_id } = req.params
  const result = await dishService.updateDishIngredient({ id, ingredient_id, updateDishIngredient: req.body })

  return res.json({
    message: DISH_INGREDIENT_MESSAGES.UPDATE_DISH_INGREDIENT_SUCCESS,
    dish: result
  })
}
export const deleteDishIngredientController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id, ingredient_id } = req.params
  const result = await dishService.deleteDishIngredient({ id, ingredient_id })

  return res.json({
    message: DISH_INGREDIENT_MESSAGES.DELETE_DISH_INGREDIENT_SUCCESS
  })
}

export const searchDishesByIngredientsController = async (
  req: Request<ParamsDictionary, any, any, SearchDishByIngredientReqQuery>,
  res: Response
) => {
  const { ingredients, page, limit, sort_by, order_by, min_calories, max_calories } = req.query
  const { dishes, total } = await dishService.searchByIngredients({
    ingredients: ingredients?.toString(),
    page: Number(page),
    limit: Number(limit),
    min_calories: min_calories ? Number(min_calories) : undefined,
    max_calories: max_calories ? Number(max_calories) : undefined,
    sort_by,
    order_by
  })
  return res.json({
    message: DISH_MESSAGES.GET_DISH_SUCCESS,
    result: {
      dishes,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
