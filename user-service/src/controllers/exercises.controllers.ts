import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { EXERCISE_MESSAGES } from '~/constants/messages'
import { ExerciseReqBody, ExerciseReqQuery, UpdateExerciseReqBody } from '~/models/requests/Exercise.requests'
import exerciseService from '~/services/exercises.services'

export const searchExercisesController = async (
  req: Request<ParamsDictionary, any, any, ExerciseReqQuery>,
  res: Response
) => {
  const { search, page, limit, type, sort_by, order_by } = req.query
  const { exercises, total } = await exerciseService.search({
    search: search?.toString(),
    type,
    page,
    limit,
    sort_by,
    order_by
  })
  return res.json({
    message: EXERCISE_MESSAGES.GET_EXERCISE_SUCCESS,
    result: {
      exercises,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addExerciseController = async (req: Request<ParamsDictionary, any, ExerciseReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await exerciseService.add({ exercise: req.body })

  return res.json({
    message: EXERCISE_MESSAGES.ADD_EXERCISE_SUCCESS,
    exercise: result
  })
}

export const updateExerciseController = async (
  req: Request<ParamsDictionary, any, UpdateExerciseReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await exerciseService.update({ id, updateExercise: req.body })

  return res.json({
    message: EXERCISE_MESSAGES.UPDATE_EXERCISE_SUCCESS,
    exercise: result
  })
}
export const getExerciseByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await exerciseService.getById({ id })

  return res.json({
    message: EXERCISE_MESSAGES.GET_EXERCISE_SUCCESS,
    exercise: result
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
export const ratingExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const { value } = req.body
  const result = await exerciseService.rating({ id, value })

  return res.json({
    message: EXERCISE_MESSAGES.RATING_EXERCISE_SUCCESS
  })
}
