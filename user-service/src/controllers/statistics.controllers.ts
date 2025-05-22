import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { STATISTIC_MESSAGES } from '~/constants/messages'
import {
  TopChallengesReqQuery,
  TopStatisticReqQuery,
  UserGrowthReqQuery,
  WorkoutWeeklyCompletionRateReqQuery
} from '~/models/requests/Statistic.requests'
import statisticService from '~/services/statistic.services'

export const getStatisticAboutTopController = async (
  req: Request<ParamsDictionary, any, any, TopStatisticReqQuery>,
  res: Response
) => {
  const { top } = req.query
  const result = await statisticService.getTop({
    top: top ? Number(top) : undefined
  })
  return res.json({
    message: STATISTIC_MESSAGES.GET_TOP_STATISTIC_SUCCESS,
    result: result
  })
}
export const getStatisticForAdminDashboardController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const result = await statisticService.getStatisticForAdminDashboard()
  return res.json({
    message: STATISTIC_MESSAGES.GET_ACTIVE_USER_AND_CHALLENGES_STATISTIC_SUCCESS,
    result: result
  })
}
export const getOverviewStatisticForAdminController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const result = await statisticService.getOverviewStatisticForAdmin()
  return res.json({
    message: STATISTIC_MESSAGES.GET_OVERVIEW_STATISTIC_SUCCESS,
    result: result
  })
}
export const getUserGrowthForOverviewStatisticController = async (
  req: Request<ParamsDictionary, any, any, UserGrowthReqQuery>,
  res: Response
) => {
  const { year } = req.query
  const result = await statisticService.getUserGrowthForOverviewStatistic({ year: Number(year) })
  return res.json({
    message: STATISTIC_MESSAGES.GET_USER_GROWTH_STATISTIC_SUCCESS,
    result: result
  })
}
export const getTopChallengesForOverviewStatisticController = async (
  req: Request<ParamsDictionary, any, any, TopChallengesReqQuery>,
  res: Response
) => {
  const { year, top } = req.query
  const result = await statisticService.getTopChallengesForOverviewStatistic({
    year: Number(year),
    top: top ? Number(top) : undefined
  })
  return res.json({
    message: STATISTIC_MESSAGES.GET_USER_GROWTH_STATISTIC_SUCCESS,
    result: result
  })
}
export const getAgeStatisticForOverviewController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const result = await statisticService.getAgeStatisticForOverview()
  return res.json({
    message: STATISTIC_MESSAGES.GET_AGE_STATISTIC_SUCCESS,
    result: result
  })
}
export const getUserStatisticController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const result = await statisticService.getUserStatistic()
  return res.json({
    message: STATISTIC_MESSAGES.GET_USER_STATISTIC_SUCCESS,
    result: result
  })
}
export const getWorkoutsStatisticController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const result = await statisticService.getWorkoutsStatistic()
  return res.json({
    message: STATISTIC_MESSAGES.GET_WORKOUTS_STATISTIC_SUCCESS,
    result: result
  })
}

export const getWorkoutWeeklyCompletionRateStatisticController = async (
  req: Request<ParamsDictionary, any, any, WorkoutWeeklyCompletionRateReqQuery>,
  res: Response
) => {
  const { year, month, week } = req.query
  const result = await statisticService.getWorkoutWeeklyCompletionRateStatistic({
    year: Number(year),
    month: Number(month),
    week: Number(week)
  })
  return res.json({
    message: STATISTIC_MESSAGES.GET_WORKOUTS_WEEKLY_COMPLETION_RATE_STATISTIC_SUCCESS,
    result: result
  })
}
export const getNutritionStatisticController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const result = await statisticService.getNutritionStatistic()
  return res.json({
    message: STATISTIC_MESSAGES.GET_NUTRITION_STATISTIC_SUCCESS,
    result: result
  })
}
