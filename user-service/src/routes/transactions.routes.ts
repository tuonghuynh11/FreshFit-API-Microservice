import { Router } from 'express'
import {
  bookingTransactionController,
  checkZaloPayTransactionStatusController,
  createZaloPayTransactionController,
  getTransactionDetailByIdController,
  getTransactionsByAccessTokenController,
  getTransactionsByUserIdController,
  refundForUserBySystemController,
  refundForUserController,
  updateTransactionStatusController,
  zaloPayCallBackTransactionController
} from '~/controllers/transactions.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import {
  getAllTransactionsByUserIdValidator,
  getTransactionDetailValidator,
  refundCoinForUserIdValidator
} from '~/middlewares/transactions.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdateTransactionStatusReqBody } from '~/models/requests/Transaction.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /transactions
const transactionsRouter = Router()

/**
 * Description: Get transaction detail by id
 * Path: /:id
 * Method: GET
 * **/
transactionsRouter.get(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  getTransactionDetailValidator,
  wrapRequestHandler(getTransactionDetailByIdController)
)
/**
 * Description: Get all transactions by accessToken
 * Path: /user/access-token
 * Method: Get
 *
 * **/
transactionsRouter.get(
  '/user/access-token',
  accessTokenValidator,
  verifiedUSerValidator,
  paginationNavigator,
  wrapRequestHandler(getTransactionsByAccessTokenController)
)

/**
 * Description: Create transaction (deposit coins)
 * Path: /deposit
 * Method: Post
 * Body: {
    "userId": "a1b2c3d4-e5f6-7890",
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "paypal",
    "transaction_reference": "PAYPAL_123456789"
  }
 * **/
transactionsRouter.post(
  '/deposit/zalo-pay',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(createZaloPayTransactionController)
)
/**
 * Description: Zalo-pay callback
 * Path: /deposit/zalo-pay/callback
 * Method: Post
 *
 * **/
transactionsRouter.post('/deposit/zalo-pay/callback', wrapRequestHandler(zaloPayCallBackTransactionController))

/**
 * Description: Zalo-pay check transaction status
 * Path: /deposit/zalo-pay/check-status-transaction
 * Method: Post
 *
 * **/
transactionsRouter.post(
  '/deposit/zalo-pay/check-status-transaction',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(checkZaloPayTransactionStatusController)
)

/**
 * Description: Get all transactions by userId
 * Path: /user/:userId
 * Method: Get
 *
 * **/
transactionsRouter.get(
  '/user/:userId',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  paginationNavigator,
  getAllTransactionsByUserIdValidator,
  wrapRequestHandler(getTransactionsByUserIdController)
)

/**
 * Description: Update transaction status
 * Path: /:id
 * Method: Patch
 * Body: {
    "status": "Pending" // [ 'Pending','Completed','Failed']
 * }
 * **/
transactionsRouter.patch(
  '/:id/status',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  filterMiddleware<UpdateTransactionStatusReqBody>(['status']),
  wrapRequestHandler(updateTransactionStatusController)
)

/**
 * Description: Refund coin for user
 * Path: /transactions/refund/:userId
 * Method: Post
 * Body: {
    "refundAmount":100
  }
 * **/
transactionsRouter.post(
  '/refund/:userId',
  accessTokenValidator,
  refundCoinForUserIdValidator,
  wrapRequestHandler(refundForUserController)
)

// =================================== External API ===================================

/**
 * Description: Make a transaction when booking an appointment
 * Path: /transactions/book/:userId
 * Method: Post
 * Body: {
    "amount":100
  }
 * **/
transactionsRouter.post('/book/:userId', refundCoinForUserIdValidator, wrapRequestHandler(bookingTransactionController))
/**
 * Description: Refund coin for user by system
 * Path: /transactions/refund/:userId/system
 * Method: Post
 * Body: {
    "refundAmount":100
  }
 * **/
transactionsRouter.post(
  '/refund/:userId/system',
  refundCoinForUserIdValidator,
  wrapRequestHandler(refundForUserBySystemController)
)
export default transactionsRouter
