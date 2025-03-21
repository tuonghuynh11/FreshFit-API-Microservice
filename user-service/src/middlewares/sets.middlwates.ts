import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { GeneralStatus, RoleTypeQueryFilter, SetType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { FILTER_MESSAGES, SETS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const addSetValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.sets.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: SETS_MESSAGES.SET_EXISTS,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      type: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [SetType],
          errorMessage: SETS_MESSAGES.INVALID_SET_TYPE
        }
      },
      number_of_exercises: {
        notEmpty: true,
        isNumeric: true
      },
      set_exercises: {
        notEmpty: true,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            console.log('value:', value)
            console.log('req.body.number_of_exercises:', req.body.number_of_exercises)
            if (value.length !== req.body.number_of_exercises) {
              throw new ErrorWithStatus({
                message: SETS_MESSAGES.INVALID_NUMBER_OF_EXERCISES,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const updateSetValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.sets.findOne({
              name: value,
              _id: {
                $ne: new ObjectId(req.params!.id)
              }
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: SETS_MESSAGES.SET_NAME_EXISTS,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      type: {
        optional: false,
        isString: true,
        isIn: {
          options: [SetType],
          errorMessage: SETS_MESSAGES.INVALID_SET_TYPE
        }
      },
      description: {
        optional: true,
        trim: true,
        isString: true
      },
      number_of_exercises: {
        notEmpty: true,
        isNumeric: true
      },
      status: {
        optional: true,
        isString: true,
        isIn: {
          options: [GeneralStatus],
          errorMessage: SETS_MESSAGES.INVALID_SET_STATUS
        }
      },
      rating: {
        optional: true,
        isNumeric: true
      },
      set_exercises: {
        optional: true,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            console.log('value:', value)
            console.log('req.body.number_of_exercises:', req.body.number_of_exercises)
            if (value.length !== req.body.number_of_exercises) {
              throw new ErrorWithStatus({
                message: SETS_MESSAGES.INVALID_NUMBER_OF_EXERCISES,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
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
