import { checkSchema } from 'express-validator'
import { STATISTIC_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const topStatisticValidator = validate(
  checkSchema(
    {
      top: {
        optional: true,
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(STATISTIC_MESSAGES.TOP_VALUE_IS_GREATER_THAN_OR_EQUAL_TO_ONE)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
