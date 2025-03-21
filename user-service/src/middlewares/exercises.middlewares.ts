import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { ExerciseCategories, ExerciseQueryTypeFilter } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { EXERCISE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const exercisesSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // exercise name

      type: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [ExerciseQueryTypeFilter],
          errorMessage: EXERCISE_MESSAGES.INVALID_EXERCISE_TYPE
        }
      }
    },
    ['query']
  )
)

export const addExerciseValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: false,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.exercises.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: EXERCISE_MESSAGES.EXERCISE_EXISTS,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      description: {
        notEmpty: false,
        trim: true
      },
      category: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [ExerciseCategories],
          errorMessage: EXERCISE_MESSAGES.INVALID_EXERCISE_TYPE
        }
      },
      calories_burn_per_minutes: {
        notEmpty: true,
        isNumeric: true
      },
      image: {
        notEmpty: false,
        isString: true
      },
      video: {
        notEmpty: false,
        isString: true
      }
    },
    ['body']
  )
)
export const updateExerciseValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.exercises.findOne({
              name: value,
              _id: { $ne: new ObjectId(req.params?.id) }
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: EXERCISE_MESSAGES.EXERCISE_EXISTS,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      description: {
        optional: true,
        trim: true
      },
      category: {
        optional: true,
        isString: true,
        isIn: {
          options: [ExerciseCategories],
          errorMessage: EXERCISE_MESSAGES.INVALID_EXERCISE_TYPE
        }
      },
      calories_burn_per_minutes: {
        optional: true,
        isNumeric: true
      },
      image: {
        optional: true,
        isString: true
      },
      video: {
        optional: true,
        isString: true
      }
    },
    ['body']
  )
)
