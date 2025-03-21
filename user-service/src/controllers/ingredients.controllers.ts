import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { EXERCISE_MESSAGES, INGREDIENT_MESSAGES } from '~/constants/messages'
import exerciseService from '~/services/exercises.services'
import { IngredientReqBody, IngredientReqQuery, UpdateIngredientReqBody } from '~/models/requests/Ingredient.requests'
import ingredientService from '~/services/ingredients.services'

export const searchIngredientExternalController = async (
  req: Request<ParamsDictionary, any, any, IngredientReqQuery>,
  res: Response
) => {
  const { search, page, limit, sort_by, order_by } = req.query
  const { ingredients, total } = await ingredientService.search({
    search: search?.toString(),
    page,
    limit,
    sort_by,
    order_by
  })
  return res.json({
    message: INGREDIENT_MESSAGES.GET_INGREDIENT_SUCCESS,
    result: {
      ingredients,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const searchIngredientController = async (
  req: Request<ParamsDictionary, any, any, IngredientReqQuery>,
  res: Response
) => {
  const { search, page, limit, sort_by, order_by } = req.query
  const { ingredients, total } = await ingredientService.search({
    search: search?.toString(),
    page,
    limit,
    sort_by,
    order_by
  })
  return res.json({
    message: INGREDIENT_MESSAGES.GET_INGREDIENT_SUCCESS,
    result: {
      ingredients,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addIngredientController = async (
  req: Request<ParamsDictionary, any, IngredientReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await ingredientService.add({ ingredient: req.body })

  return res.json({
    message: INGREDIENT_MESSAGES.ADD_INGREDIENT_SUCCESS,
    ingredient: result
  })
}

export const updateIngredientController = async (
  req: Request<ParamsDictionary, any, UpdateIngredientReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await ingredientService.update({ id, updateIngredient: req.body })

  return res.json({
    message: INGREDIENT_MESSAGES.UPDATE_INGREDIENT_SUCCESS,
    ingredient: result
  })
}
export const getIngredientByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await ingredientService.getById({ id })

  return res.json({
    message: INGREDIENT_MESSAGES.GET_INGREDIENT_SUCCESS,
    ingredient: result
  })
}
export const getAllExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const result = await exerciseService.getAll()

  return res.json({
    message: EXERCISE_MESSAGES.GET_ALL_EXERCISE_SUCCESS,
    exercises: result
  })
}
export const deleteIngredientController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await ingredientService.delete({ id })

  return res.json({
    message: INGREDIENT_MESSAGES.DELETE_INGREDIENT_SUCCESS
  })
}
