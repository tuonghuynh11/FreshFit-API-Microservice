import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { ExerciseCategories, ExerciseType, ForceType, LevelType, MechanicsType } from '~/constants/enums'
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
      } // exercise name

      // type: {
      //   optional: false,
      //   notEmpty: false,
      //   isString: true,
      //   isIn: {
      //     options: [ExerciseType],
      //     errorMessage: EXERCISE_MESSAGES.INVALID_EXERCISE_TYPE
      //   }
      // }
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
          errorMessage: EXERCISE_MESSAGES.INVALID_EXERCISE_CATEGORY
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
      },
      target_muscle: {
        optional: true
      },
      type: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [ExerciseType],
          errorMessage: EXERCISE_MESSAGES.INVALID_EXERCISE_TYPE
        }
      },
      equipment: {
        optional: true
      },
      mechanics: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [MechanicsType],
          errorMessage: EXERCISE_MESSAGES.INVALID_MECHANICS_TYPE
        }
      },
      forceType: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [ForceType],
          errorMessage: EXERCISE_MESSAGES.INVALID_FORCE_TYPE
        }
      },
      experience_level: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [LevelType],
          errorMessage: EXERCISE_MESSAGES.INVALID_EXPERIENCE_LEVEL
        }
      },
      secondary_muscle: {
        optional: true
      },
      instructions: {
        optional: true
      },
      tips: {
        optional: true
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
export const checkOriginalExerciseValidator = validate(
  checkSchema(
    {
      id: {
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
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (!isExist.is_custom) {
              throw new ErrorWithStatus({
                message: EXERCISE_MESSAGES.CAN_NOT_EDIT_OR_DELETE_ORIGINAL_EXERCISE,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
