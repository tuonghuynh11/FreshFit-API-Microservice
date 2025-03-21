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
import { FILTER_MESSAGES, WORKOUT_PLAN_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const workoutPlansSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // workout plan name
      type: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [WorkoutPlanQueryTypeFilter],
          errorMessage: WORKOUT_PLAN_MESSAGES.INVALID_WORKOUT_PLAN_TYPE
        }
      },
      status: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [GeneralQueryStatusFilter],
          errorMessage: WORKOUT_PLAN_MESSAGES.INVALID_WORKOUT_PLAN_STATUS
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

export const addWorkoutPlanValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.workoutPlans.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_NAME_EXISTS,
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
      number_of_set: {
        notEmpty: true,
        isNumeric: true
      },
      estimated_calories_burned: {
        notEmpty: true,
        isNumeric: true
      },
      type: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [WorkoutType],
          errorMessage: WORKOUT_PLAN_MESSAGES.INVALID_WORKOUT_PLAN_TYPE
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
      details: {
        notEmpty: false,
        isArray: true
      }
    },
    ['body']
  )
)
export const updateWorkoutPlanValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.workoutPlans.findOne({
              name: value,
              _id: {
                $ne: new ObjectId(req.params!.id)
              }
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: WORKOUT_PLAN_MESSAGES.WORKOUT_PLAN_NAME_EXISTS,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      description: {
        optional: false,
        trim: true
      },
      number_of_set: {
        optional: true,
        isNumeric: true
      },
      estimated_calories_burned: {
        optional: true,
        isNumeric: true
      },
      type: {
        optional: true,
        isString: true,
        isIn: {
          options: [WorkoutType],
          errorMessage: WORKOUT_PLAN_MESSAGES.INVALID_WORKOUT_PLAN_TYPE
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
          errorMessage: WORKOUT_PLAN_MESSAGES.INVALID_WORKOUT_PLAN_STATUS
        }
      }
    },
    ['body']
  )
)
