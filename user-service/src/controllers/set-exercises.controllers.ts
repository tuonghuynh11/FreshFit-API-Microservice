import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { SET_EXERCISE_MESSAGES, SETS_MESSAGES } from '~/constants/messages'
import setService from '~/services/sets.services'
import { BaseReqQuery } from '~/models/requests/Index.request'
import { SetExerciseReqBody, UpdateSetExerciseReqBody } from '~/models/requests/SetExercise.requests'
import setExerciseService from '~/services/set-exercises.services'

export const searchSetsController = async (req: Request<ParamsDictionary, any, any, BaseReqQuery>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { search, type, page, limit, sort_by, order_by } = req.query
  const { sets, total } = await setService.search({
    search: search?.toString(),
    page,
    limit,
    sort_by,
    order_by,
    type,
    user_id,
    role
  })
  return res.json({
    message: SETS_MESSAGES.GET_SET_SUCCESS,
    result: {
      sets,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addSetExerciseController = async (
  req: Request<ParamsDictionary, any, SetExerciseReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const setId = req.params.setId
  const result = await setExerciseService.add({ setId, set_exercise: req.body, user_id, role })

  return res.json({
    message: SET_EXERCISE_MESSAGES.ADD_SET_EXERCISE_SUCCESS,
    set_exercise: result
  })
}

export const updateSetExerciseController = async (
  req: Request<ParamsDictionary, any, UpdateSetExerciseReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { setId, id } = req.params
  const result = await setExerciseService.update({ user_id, role, setId, id, updateSetExercise: req.body })

  return res.json({
    message: SET_EXERCISE_MESSAGES.UPDATE_SET_EXERCISE_SUCCESS,
    set: result
  })
}
export const getSetExerciseByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id, setId } = req.params
  const result = await setExerciseService.getById({ id, setId, user_id, role })

  return res.json({
    message: SETS_MESSAGES.GET_SET_SUCCESS,
    set: result
  })
}

export const deleteSetsExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id, setId } = req.params
  const result = await setExerciseService.delete({ setId, id, user_id, role })

  return res.json({
    message: SET_EXERCISE_MESSAGES.DELETE_SET_EXERCISE_SUCCESS
  })
}
