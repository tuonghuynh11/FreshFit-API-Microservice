import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { EXERCISE_MESSAGES, WORKOUT_PLAN_DETAILS_MESSAGES } from '~/constants/messages'
import exerciseService from '~/services/exercises.services'
import workoutPlanDetailsService from '~/services/workout-plan-details.services'
import { UpdateWorkoutPlanDetailReqBody, WorkoutPlanDetailReqBody } from '~/models/requests/WorkoutPlanDetail.requests'

export const searchWorkoutPlanDetailsController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const { status, week } = req.query
  const workoutPlanId = req.params.workoutPlanId
  const result = await workoutPlanDetailsService.search({
    workoutPlanId,
    status,
    week
  })
  return res.json({
    message: EXERCISE_MESSAGES.GET_EXERCISE_SUCCESS,
    result
  })
}

export const addWorkoutPlanDetailsController = async (
  req: Request<ParamsDictionary, any, WorkoutPlanDetailReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const workoutPlanId = req.params.workoutPlanId
  const result = await workoutPlanDetailsService.add({ workoutPlanId, user_id, role, workout_plan_detail: req.body })

  return res.json({
    message: WORKOUT_PLAN_DETAILS_MESSAGES.ADD_WORKOUT_PLAN_DETAILS_SUCCESS,
    workout_plan_detail: result
  })
}
export const addSetForWorkoutPlanDetailsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { workoutPlanId, id } = req.params
  const result = await workoutPlanDetailsService.addSet({
    workoutPlanId,
    user_id,
    role,
    workoutPlanDetailId: id,
    set: req.body
  })

  return res.json({
    message: WORKOUT_PLAN_DETAILS_MESSAGES.ADD_SET_FOR_WORKOUT_PLAN_DETAILS_SUCCESS,
    workout_plan_detail: result
  })
}
export const deleteSetInWorkoutPlanDetailsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { workoutPlanId, id, setId } = req.params
  const result = await workoutPlanDetailsService.deleteSet({
    workoutPlanId,
    user_id,
    role,
    workoutPlanDetailId: id,
    setId
  })

  return res.json({
    message: WORKOUT_PLAN_DETAILS_MESSAGES.DELETE_SET_IN_WORKOUT_PLAN_DETAILS_SUCCESS
  })
}

export const updateWorkoutPlanDetailController = async (
  req: Request<ParamsDictionary, any, UpdateWorkoutPlanDetailReqBody>,
  res: Response
) => {
  const { id, workoutPlanId } = req.params
  const result = await workoutPlanDetailsService.update({ id, updateWorkoutPlanDetail: req.body, workoutPlanId })

  return res.json({
    message: WORKOUT_PLAN_DETAILS_MESSAGES.UPDATE_WORKOUT_PLAN_DETAILS_SUCCESS,
    workout_plan_detail: result
  })
}
export const getWorkoutPlanDetailByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id, workoutPlanId } = req.params
  const result = await workoutPlanDetailsService.getById({ id, workoutPlanId })

  return res.json({
    message: WORKOUT_PLAN_DETAILS_MESSAGES.GET_WORKOUT_PLAN_DETAILS_SUCCESS,
    workout_plan_detail: result
  })
}
export const getAllExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const result = await exerciseService.getAll()

  return res.json({
    message: EXERCISE_MESSAGES.GET_ALL_EXERCISE_SUCCESS,
    exercises: result
  })
}
export const deleteWorkoutPlanDetailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const workoutPlanId = req.params.workoutPlanId

  const result = await workoutPlanDetailsService.delete({ id, workoutPlanId })

  return res.json({
    message: WORKOUT_PLAN_DETAILS_MESSAGES.DELETE_WORKOUT_PLAN_DETAILS_SUCCESS
  })
}
