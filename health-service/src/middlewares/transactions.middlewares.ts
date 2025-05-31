import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const getAllTransactionsByUserIdValidator = validate(
  checkSchema(
    {
      userId: {
        isEmpty: false,
        isString: true
      }
    },
    ['params']
  )
)

export const refundCoinForUserIdValidator = validate(
  checkSchema(
    {
      userId: {
        isEmpty: false
        // isString: true
      }
    },
    ['params']
  )
)
export const getTransactionDetailValidator = validate(
  checkSchema(
    {
      id: {
        isEmpty: false,
        isString: true
      }
    },
    ['params']
  )
)
