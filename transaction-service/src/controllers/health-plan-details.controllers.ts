import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { HEALTH_PLAN_DETAILS_MESSAGES } from '~/constants/messages'
import healthPlanDetailsService from '~/services/health-plan-details.services'
import {
  AddMealForNutritionDetailsReqBody,
  AddSetForWorkoutDetailsReqBody,
  DeleteMealForNutritionDetailsReqBody,
  DeleteSetForWorkoutDetailsReqBody,
  HealthPlanDetailReqBody,
  UpdateHealthPlanDetailReqBody,
  UpdateItemStatusInNutritionDetailsReqBody,
  UpdateOrderNumberInNutritionDetailsReqBody,
  UpdateOrderNumberInWorkoutDetailsReqBody,
  UpdateWorkoutDetailsStatusReqBody
} from '~/models/requests/HealthPlanDetails.requests'

export const getAllByHealthPlanIdController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { week } = req.query
  const healthPlanId = req.params.healthPlanId
  const result = await healthPlanDetailsService.search({
    healthPlanId,
    week
  })
  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.GET_HEALTH_PLAN_DETAILS_SUCCESS,
    result
  })
}

export const addHealthPlanDetailsController = async (
  req: Request<ParamsDictionary, any, HealthPlanDetailReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const healthPlanId = req.params.healthPlanId
  const result = await healthPlanDetailsService.add({ healthPlanId, user_id, role, health_plan_detail: req.body })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.ADD_HEALTH_PLAN_DETAILS_SUCCESS,
    health_plan_detail: result
  })
}

export const deleteSetInHealthPlanDetailsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { workoutPlanId, id, setId } = req.params
  const result = await healthPlanDetailsService.deleteSet({
    workoutPlanId,
    user_id,
    role,
    workoutPlanDetailId: id,
    setId
  })

  return res.json({
    // message: HEALTH_PLAN_DETAILS_MESSAGES.DELETE_SET_IN_WORKOUT_PLAN_DETAILS_SUCCESS
  })
}

export const updateHealthPlanDetailController = async (
  req: Request<ParamsDictionary, any, UpdateHealthPlanDetailReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await healthPlanDetailsService.update({ id, updateHealthPlanDetail: req.body })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.UPDATE_HEALTH_PLAN_DETAILS_SUCCESS,
    health_plan_detail: result
  })
}
export const getHealthPlanDetailByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await healthPlanDetailsService.getById({ id })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.GET_HEALTH_PLAN_DETAILS_SUCCESS,
    health_plan_detail: result
  })
}

export const deleteHealthPlanDetailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { healthPlanId, id } = req.params

  const result = await healthPlanDetailsService.delete({ id, healthPlanId })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.DELETE_HEALTH_PLAN_DETAILS_SUCCESS
  })
}

export const addSetForWorkoutDetailsController = async (
  req: Request<ParamsDictionary, any, AddSetForWorkoutDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const result = await healthPlanDetailsService.addSetForWorkoutDetails({ id, sets: req.body.sets })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.ADD_SET_FOR_WORKOUT_DETAIL_SUCCESS,
    workout_details: result
  })
}
export const updateWorkoutDetailsStatusController = async (
  req: Request<ParamsDictionary, any, UpdateWorkoutDetailsStatusReqBody>,
  res: Response
) => {
  const id = req.params.id
  const { ids, status } = req.body
  const result = await healthPlanDetailsService.updateWorkoutDetailsStatus({ id, ids: ids, status })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.UPDATE_WORKOUT_DETAIL_STATUS_SUCCESS,
    workout_details: result
  })
}
export const deleteItemInWorkoutDetailsController = async (
  req: Request<ParamsDictionary, any, DeleteSetForWorkoutDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const { ids } = req.body
  const result = await healthPlanDetailsService.deleteItemInWorkoutDetails({ id, ids: ids })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.DELETE_ITEMS_IN_WORKOUT_DETAIL_SUCCESS,
    workout_details: result
  })
}

export const updateOrderNumberOfItemsInWorkoutDetailsController = async (
  req: Request<ParamsDictionary, any, UpdateOrderNumberInWorkoutDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const { workout_details } = req.body
  const result = await healthPlanDetailsService.updateOrderNumberOfItemsInWorkoutDetails({
    id,
    workout_details: workout_details
  })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.UPDATE_WORKOUT_DETAIL_ORDER_NUMBER_SUCCESS,
    workout_details: result
  })
}

export const addMealForNutritionDetailsController = async (
  req: Request<ParamsDictionary, any, AddMealForNutritionDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const result = await healthPlanDetailsService.addMealForNutritionDetails({ id, meals: req.body.meals })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.ADD_MEALS_FOR_NUTRITION_DETAIL_SUCCESS,
    nutrition_details: result
  })
}

export const updateOrderNumberOfItemsInNutritionDetailsController = async (
  req: Request<ParamsDictionary, any, UpdateOrderNumberInNutritionDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const { nutrition_details: temp } = req.body
  const result = await healthPlanDetailsService.updateOrderNumberOfItemsInNutritionDetails({
    id,
    nutrition_details: temp
  })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.UPDATE_WORKOUT_DETAIL_ORDER_NUMBER_SUCCESS,
    workout_details: result
  })
}

export const updateItemStatusInNutritionDetailsController = async (
  req: Request<ParamsDictionary, any, UpdateItemStatusInNutritionDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const { ids, status } = req.body
  const result = await healthPlanDetailsService.updateItemStatusInNutritionDetails({ id, ids: ids, status })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.UPDATE_ITEM_IN_NUTRITION_STATUS_SUCCESS,
    nutrition_details: result
  })
}
export const deleteItemInNutritionDetailsController = async (
  req: Request<ParamsDictionary, any, DeleteMealForNutritionDetailsReqBody>,
  res: Response
) => {
  const id = req.params.id
  const { ids } = req.body
  const result = await healthPlanDetailsService.deleteItemInNutritionDetails({ id, ids: ids })

  return res.json({
    message: HEALTH_PLAN_DETAILS_MESSAGES.DELETE_ITEMS_IN_NUTRITION_DETAIL_SUCCESS,
    nutrition_details: result
  })
}
