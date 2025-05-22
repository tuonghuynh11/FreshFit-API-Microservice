import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { STATISTIC_MESSAGES } from '~/constants/messages'
import { TopStatisticReqQuery } from '~/models/requests/Statistic.requests'
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
