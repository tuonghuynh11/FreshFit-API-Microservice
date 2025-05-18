import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import {
  GeneralQueryStatusFilter,
  GeneralStatus,
  RoleTypeQueryFilter,
  WorkoutPlanQueryTypeFilter,
  WorkoutType
} from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { FILTER_MESSAGES, HEALTH_PLAN_MESSAGES, WORKOUT_PLAN_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const addHealthPlanValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            console.log('Name: ', value)
            const isExist = await databaseService.healthPlans.findOne({
              name: value.toString()
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NAME_EXISTS,
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

      estimated_calories_burned: {
        optional: true,
        isNumeric: true
      },
      estimated_calories_intake: {
        optional: true,
        isNumeric: true
      },
      level: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [WorkoutType],
          errorMessage: HEALTH_PLAN_MESSAGES.INVALID_HEALTH_PLAN_LEVEL
        }
      },
      start_date: {
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: WORKOUT_PLAN_MESSAGES.START_DATE_MUST_BE_ISO8601
        }
      },
      end_date: {
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: WORKOUT_PLAN_MESSAGES.END_DATE_MUST_BE_ISO8601
        }
      },
      number_of_weeks: {
        notEmpty: false,
        isNumeric: true
      }
    },
    ['body']
  )
)

export const updateHealthPlanValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.healthPlans.findOne({
              name: value,
              _id: {
                $ne: new ObjectId(req.params!.id)
              }
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: HEALTH_PLAN_MESSAGES.HEALTH_PLAN_NAME_EXISTS,
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

      estimated_calories_burned: {
        optional: true,
        isNumeric: true
      },
      estimated_calories_intake: {
        optional: true,
        isNumeric: true
      },
      level: {
        optional: true,
        isString: true,
        isIn: {
          options: [WorkoutType],
          errorMessage: HEALTH_PLAN_MESSAGES.INVALID_HEALTH_PLAN_LEVEL
        }
      },
      start_date: {
        optional: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: WORKOUT_PLAN_MESSAGES.START_DATE_MUST_BE_ISO8601
        }
      },
      end_date: {
        optional: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: WORKOUT_PLAN_MESSAGES.END_DATE_MUST_BE_ISO8601
        }
      },
      status: {
        optional: true,
        isString: true,
        isIn: {
          options: [GeneralStatus],
          errorMessage: HEALTH_PLAN_MESSAGES.INVALID_HEALTH_PLAN_STATUS
        }
      }
    },
    ['body']
  )
)

export const healthPlansSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // workout plan name
      level: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [WorkoutPlanQueryTypeFilter],
          errorMessage: HEALTH_PLAN_MESSAGES.INVALID_HEALTH_PLAN_LEVEL
        }
      },
      status: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [GeneralQueryStatusFilter],
          errorMessage: HEALTH_PLAN_MESSAGES.INVALID_HEALTH_PLAN_STATUS
        }
      },
      source: {
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
