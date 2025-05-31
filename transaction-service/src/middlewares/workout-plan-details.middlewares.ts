import { checkSchema } from 'express-validator'
import { GeneralQueryStatusFilter, GeneralStatus } from '~/constants/enums'
import { WORKOUT_PLAN_DETAILS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const workoutPlanDetailSearchValidator = validate(
  checkSchema(
    {
      status: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [GeneralQueryStatusFilter],
          errorMessage: WORKOUT_PLAN_DETAILS_MESSAGES.INVALID_WORKOUT_PLAN_DETAILS_STATUS
        }
      }
    },
    ['query']
  )
)

export const addWorkoutPlanDetailValidator = validate(
  checkSchema(
    {
      day: {
        notEmpty: true,
        isNumeric: true
      },
      week: {
        notEmpty: false,
        isNumeric: true
      },
      sets: {
        notEmpty: false,
        isArray: true
      }
    },
    ['body']
  )
)
export const updateWorkoutPlanDetailValidator = validate(
  checkSchema(
    {
      day: {
        optional: true,
        isNumeric: true
      },
      week: {
        optional: true,
        isNumeric: true
      },
      status: {
        optional: true,
        isString: true,
        isIn: {
          options: [GeneralStatus],
          errorMessage: WORKOUT_PLAN_DETAILS_MESSAGES.INVALID_WORKOUT_PLAN_DETAILS_STATUS
        }
      }
    },
    ['body']
  )
)
