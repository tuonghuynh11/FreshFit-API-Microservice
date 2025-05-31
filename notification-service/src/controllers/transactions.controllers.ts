import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { TRANSACTION_MESSAGES } from '~/constants/messages'
import { TransactionReqBody, UpdateTransactionStatusReqBody } from '~/models/requests/Transaction.requests'
import transactionService from '~/services/transaction.services'
import { PaginationReqQuery } from '~/models/requests/Pagination.requests'

export const getTransactionsByUserIdController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { page, limit } = req.query
  const { userId } = req.params
  console.log('user_id', userId)

  const { transactions, total, totalAmount } = await transactionService.getAllByUserId({
    page: Number(page),
    limit: Number(limit),
    userId
  })
  return res.json({
    message: TRANSACTION_MESSAGES.GET_TRANSACTION_BY_USERID_SUCCESS,
    result: {
      totalAmount,
      transactions,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const getTransactionsByAccessTokenController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { page, limit } = req.query

  console.log('user_id: ' + user_id)

  const { transactions, total, totalAmount } = await transactionService.getAllByUserId({
    page: Number(page),
    limit: Number(limit),
    userId: user_id
  })
  return res.json({
    message: TRANSACTION_MESSAGES.GET_TRANSACTION_SUCCESS,
    result: {
      totalAmount,
      transactions,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const getTransactionDetailByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const id = req.params.id
  const result = await transactionService.getById({ user_id, role, id })

  return res.json({
    message: TRANSACTION_MESSAGES.GET_TRANSACTION_SUCCESS,
    transaction: result
  })
}
export const createZaloPayTransactionController = async (
  req: Request<ParamsDictionary, any, TransactionReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await transactionService.createZaloPayTransaction({ newTransaction: req.body })

  return res.json({
    message: TRANSACTION_MESSAGES.CREATE_TRANSACTION_SUCCESS,
    transaction: result
  })
}
export const zaloPayCallBackTransactionController = async (
  req: Request<ParamsDictionary, any, Request>,
  res: Response
) => {
  const result = await transactionService.zaloPayTransactionCallback({ req: req })

  return res.json({
    message: TRANSACTION_MESSAGES.PAYMENT_SUCCESS,
    transaction: result
  })
}
export const checkZaloPayTransactionStatusController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const result = await transactionService.checkZaloPayTransactionStatus({
    transactionReference: req.body.transactionReference as string
  })

  return res.json({
    message: TRANSACTION_MESSAGES.CHECK_TRANSACTION_STATUS_SUCCESS,
    transaction: result
  })
}

export const updateTransactionStatusController = async (
  req: Request<ParamsDictionary, any, UpdateTransactionStatusReqBody>,
  res: Response
) => {
  const id = req.params.id
  const result = await transactionService.updateStatus({ id, status: req.body.status })

  return res.json({
    message: TRANSACTION_MESSAGES.UPDATE_TRANSACTION_STATUS_SUCCESS,
    transaction: result
  })
}

export const refundForUserController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { userId } = req.params
  const { refundAmount } = req.body
  const result = await transactionService.refundForUser({ userId, refundAmount })

  return res.json({
    message: TRANSACTION_MESSAGES.REFUND_SUCCESS,
    transaction: result
  })
}
export const refundForUserBySystemController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { userId } = req.params
  const { refundAmount } = req.body
  const result = await transactionService.refundForUser({ userId, refundAmount })

  return res.json({
    message: TRANSACTION_MESSAGES.REFUND_SUCCESS,
    transaction: result
  })
}
export const bookingTransactionController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { userId } = req.params
  const { amount } = req.body
  const result = await transactionService.makeBookingTrans({ userId, amount })

  return res.json({
    message: TRANSACTION_MESSAGES.MAKE_BOOKING_TRANSACTION_SUCCESS,
    transaction: result
  })
}
