import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { CHALLENGE_MESSAGES, EXERCISE_MESSAGES } from '~/constants/messages'
import exerciseService from '~/services/exercises.services'
import {
  ChallengeLeaderBoardReqQuery,
  ChallengeReqBody,
  ChallengeReqQuery,
  UpdateChallengeReqBody
} from '~/models/requests/Challenge.requests'
import challengesService from '~/services/challenge.services'

export const searchChallengesController = async (
  req: Request<ParamsDictionary, any, any, ChallengeReqQuery>,
  res: Response
) => {
  const { search, page, limit, status, type, sort_by, order_by } = req.query
  const { challenges, total } = await challengesService.search({
    search: search?.toString(),
    status,
    type,
    page: Number(page),
    limit: Number(limit),
    sort_by,
    order_by
  })
  return res.json({
    message: CHALLENGE_MESSAGES.GET_CHALLENGE_SUCCESS,
    result: {
      challenges,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addChallengeController = async (req: Request<ParamsDictionary, any, ChallengeReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await challengesService.add({ challenge: req.body, userId: user_id, role })

  return res.json({
    message: CHALLENGE_MESSAGES.ADD_CHALLENGE_SUCCESS,
    challenge: result
  })
}

export const updateChallengeController = async (
  req: Request<ParamsDictionary, any, UpdateChallengeReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await challengesService.update({ id, updateChallenge: req.body })

  return res.json({
    message: CHALLENGE_MESSAGES.UPDATE_CHALLENGE_SUCCESS,
    challenge: result
  })
}

export const getChallengeByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await challengesService.getById({ id })

  return res.json({
    message: CHALLENGE_MESSAGES.GET_CHALLENGE_SUCCESS,
    challenge: result
  })
}
export const getAllExerciseController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const result = await exerciseService.getAll()

  return res.json({
    message: EXERCISE_MESSAGES.GET_ALL_EXERCISE_SUCCESS,
    exercises: result
  })
}
export const joinChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await challengesService.join({ user_id, id })

  return res.json({
    message: CHALLENGE_MESSAGES.JOIN_CHALLENGE_SUCCESS,
    user_challenge_participation_id: result
  })
}
export const activateChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params

  const result = await challengesService.activate({ id })

  return res.json({
    message: CHALLENGE_MESSAGES.ACTIVATE_CHALLENGE_SUCCESS
  })
}
export const deactivateChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params

  const result = await challengesService.deactivate({ id })

  return res.json({
    message: CHALLENGE_MESSAGES.DEACTIVATE_CHALLENGE_SUCCESS
  })
}
export const deleteChallengeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const result = await challengesService.delete({ id })

  return res.json({
    message: CHALLENGE_MESSAGES.DELETE_CHALLENGE_SUCCESS
  })
}

export const getChallengeLeaderboardController = async (
  req: Request<ParamsDictionary, any, any, ChallengeLeaderBoardReqQuery>,
  res: Response
) => {
  const { page, limit } = req.query
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const { leaderboard, total } = await challengesService.getLeaderboard({
    id,
    user_id,
    page: Number(page),
    limit: Number(limit)
  })
  return res.json({
    message: CHALLENGE_MESSAGES.GET_CHALLENGE_LEADERBOARD_SUCCESS,
    result: {
      leaderboard,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const getChallengeGeneralStatisticController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const { page, limit } = req.query
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await challengesService.getChallengeGeneralStatistic({
    id,
    user_id
  })
  return res.json({
    message: CHALLENGE_MESSAGES.GET_CHALLENGE_GENERAL_STATISTIC_SUCCESS,
    result
  })
}
