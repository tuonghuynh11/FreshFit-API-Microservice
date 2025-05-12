import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { HEALTH_PLAN_MESSAGES, USER_CHALLENGE_PARTICIPATION_MESSAGES } from '~/constants/messages'
import { HealthPlanReqBody } from '~/models/requests/HealthPlans.requests'
import {
  GetUserChallengeProgressReqQuery,
  UpdateProgressEachDayReqBody,
  UserChallengeParticipationReqQuery
} from '~/models/requests/User-challenge-participation.request'
import userChallengeParticipationService from '~/services/user-challenge-participation.services'

export const searchUserChallengeParticipationController = async (
  req: Request<ParamsDictionary, any, any, UserChallengeParticipationReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { search, page, limit, status, sort_by, order_by } = req.query
  const { user_challenges, total } = await userChallengeParticipationService.search({
    search: search?.toString(),
    status,
    page: Number(page),
    limit: Number(limit),
    sort_by,
    order_by,
    user_id,
    role
  })
  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.GET_ALL_USER_CHALLENGE_PARTICIPATION_SUCCESS,
    result: {
      user_challenges,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addHealthPlanController = async (
  req: Request<ParamsDictionary, any, HealthPlanReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await userChallengeParticipationService.add({ user_id, role, healthPlan: req.body })

  return res.json({
    message: HEALTH_PLAN_MESSAGES.ADD_HEALTH_PLAN_SUCCESS,
    health_plan: result
  })
}

export const updateProgressEachDayController = async (
  req: Request<ParamsDictionary, any, UpdateProgressEachDayReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { userChallengeParticipationProgressId } = req.params
  const { completed_workouts, completed_nutritions } = req.body
  const result = await userChallengeParticipationService.updateProgressEachDay({
    userChallengeParticipationProgressId,
    completed_workouts,
    completed_nutritions,
    user_id,
    role
  })

  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.UPDATE_PROGRESS_EACH_DAY_SUCCESS,
    result
  })
}
export const getGetUserChallengeProgressController = async (
  req: Request<ParamsDictionary, any, GetUserChallengeProgressReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { id } = req.params
  const { week, day } = req.query
  const result = await userChallengeParticipationService.getUserChallengeProgress({
    id,
    user_id,
    role,
    week: Number(week),
    day: Number(day)
  })

  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.GET_USER_CHALLENGE_PROGRESS_SUCCESS,
    user_challenge_process: result
  })
}
export const getUserChallengeOverviewController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { id } = req.params
  const result = await userChallengeParticipationService.getUserChallengeOverview({
    id,
    user_id,
    role
  })

  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.GET_USER_CHALLENGE_OVERVIEW_SUCCESS,
    user_challenge_overview: result
  })
}

export const finishChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await userChallengeParticipationService.finishChallenge({ id, user_id, role })

  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.FINISH_CHALLENGE_SUCCESS
  })
}
export const startChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const { start_date } = req.body
  const result = await userChallengeParticipationService.startChallenge({
    id,
    start_date: new Date(start_date),
    user_id,
    role
  })

  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.START_CHALLENGE_SUCCESS
  })
}
export const deleteUserChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const { start_date } = req.body
  const result = await userChallengeParticipationService.deleteUserChallenge({
    id,
    user_id,
    role
  })

  return res.json({
    message: USER_CHALLENGE_PARTICIPATION_MESSAGES.DELETE_USER_CHALLENGE_PARTICIPATION_SUCCESS
  })
}
