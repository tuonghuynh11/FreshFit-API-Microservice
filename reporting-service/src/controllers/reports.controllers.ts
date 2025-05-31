import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { DISH_MESSAGES, REPORT_MESSAGES } from '~/constants/messages'
import { UpdateDishReqBody } from '~/models/requests/Dishes.requests'
import dishService from '~/services/dishes.services'
import { ReportReqBody, ReportReqQuery } from '~/models/requests/Report.requests'
import reportService from '~/services/reports.services'

export const searchReportsController = async (
  req: Request<ParamsDictionary, any, any, ReportReqQuery>,
  res: Response
) => {
  const { search, page, limit, sort_by, order_by } = req.query
  const { reports, total } = await reportService.search({
    search: search?.toString(),
    page,
    limit,
    sort_by,
    order_by
  })
  return res.json({
    message: REPORT_MESSAGES.GET_REPORT_SUCCESS,
    result: {
      reports,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addReportController = async (req: Request<ParamsDictionary, any, ReportReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await reportService.add({ user_id, report: req.body })

  return res.json({
    message: REPORT_MESSAGES.ADD_REPORT_SUCCESS,
    report: result
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
export const getReportByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await reportService.getById({ id, user_id, role })

  return res.json({
    message: REPORT_MESSAGES.GET_REPORT_SUCCESS,
    report: result
  })
}
export const updateReportStatusController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { reportIds, status } = req.body
  const result = await reportService.updateReportStatus({ reportIds, status })

  return res.json({
    message: REPORT_MESSAGES.READ_REPORT_SUCCESS
  })
}
