import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { RoleTypeQueryFilter } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { EXERCISE_MESSAGES, FILTER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const addSetExerciseValidator = validate(
  checkSchema(
    {
      exercise_id: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.exercises.findOne({
              _id: new ObjectId(value)
            })
            if (!isExist) {
              throw new ErrorWithStatus({
                message: EXERCISE_MESSAGES.EXERCISE_NOT_FOUND,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      duration: {
        notEmpty: true,
        isNumeric: true
      },
      reps: {
        notEmpty: true,
        isNumeric: true
      },
      round: {
        notEmpty: true,
        isNumeric: true
      },
      rest_per_round: {
        notEmpty: true,
        isNumeric: true
      },
      estimated_calories_burned: {
        notEmpty: true,
        isNumeric: true
      }
    },
    ['body']
  )
)
export const updateSetExerciseValidator = validate(
  checkSchema(
    {
      exercise_id: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.exercises.findOne({
              _id: new ObjectId(value)
            })
            if (!isExist) {
              throw new ErrorWithStatus({
                message: EXERCISE_MESSAGES.EXERCISE_NOT_FOUND,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      duration: {
        optional: true,
        isNumeric: true
      },
      reps: {
        optional: true,
        isNumeric: true
      },
      round: {
        optional: true,
        isNumeric: true
      },
      rest_per_round: {
        optional: true,
        isNumeric: true
      },
      estimated_calories_burned: {
        optional: true,
        isNumeric: true
      }
    },
    ['body']
  )
)

export const setsSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // set name
      type: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [RoleTypeQueryFilter],
          errorMessage: FILTER_MESSAGES.INVALID_ROLE_TYPE
        }
      }
    },
    ['query']
  )
)
