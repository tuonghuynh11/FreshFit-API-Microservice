import { checkSchema } from 'express-validator'
import { MealQueryType, RoleTypeQueryFilter } from '~/constants/enums'
import { FILTER_MESSAGES, MEALS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const mealsSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // meal name

      type: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [RoleTypeQueryFilter],
          errorMessage: FILTER_MESSAGES.INVALID_ROLE_TYPE
        }
      },
      meal_type: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [MealQueryType],
          errorMessage: MEALS_MESSAGES.INVALID_MEAL_TYPE
        }
      }
    },
    ['query']
  )
)
