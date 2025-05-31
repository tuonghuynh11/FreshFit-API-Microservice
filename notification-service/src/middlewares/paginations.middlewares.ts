import { checkSchema } from 'express-validator'
import { PAGINATION_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const paginationNavigator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1 || num > 100) {
              throw new Error(PAGINATION_MESSAGES.PAGE_SIZE_MAXIMUM_IS_100_AND_MINIMAL_IS_ONE)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(PAGINATION_MESSAGES.PAGE_IS_ALWAYS_GREATER_THAN_OR_EQUAL_TO_ONE)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
