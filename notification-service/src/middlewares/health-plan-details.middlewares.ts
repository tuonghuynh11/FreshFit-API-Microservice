import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { GeneralStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, HEALTH_PLAN_DETAILS_MESSAGES, MEALS_MESSAGES, SETS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const addHealthPlanDetailValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: true
      },
      day: {
        notEmpty: true,
        isNumeric: true
      },
      week: {
        notEmpty: false,
        isNumeric: true
      },
      workout_details: {
        optional: true,

        isArray: true
      },
      nutrition_details: {
        optional: true,

        isArray: true
      },
      estimated_calories_burned: {
        optional: true,
        isNumeric: true
      },
      estimated_calories_intake: {
        optional: true,
        isNumeric: true
      }
    },
    ['body']
  )
)
export const updateHealthPlanDetailValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: true
      },
      day: {
        optional: true,

        isNumeric: true
      },
      week: {
        optional: true,

        isNumeric: true
      },
      estimated_calories_burned: {
        optional: true,
        isNumeric: true
      },
      estimated_calories_intake: {
        optional: true,
        isNumeric: true
      },
      status: {
        optional: true,
        isString: true,
        isIn: {
          options: [GeneralStatus],
          errorMessage: HEALTH_PLAN_DETAILS_MESSAGES.INVALID_HEALTH_PLAN_DETAILS_STATUS
        }
      }
    },
    ['body']
  )
)

export const addSetForWorkoutDetailValidator = validate(
  checkSchema(
    {
      sets: {
        notEmpty: true,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            //FInd Set in database
            const sets = await databaseService.sets
              .find({
                _id: { $in: value.map((item: { id: string; orderNumber: number }) => new ObjectId(item.id)) }
              })
              .toArray()
            if (sets.length !== value.length) {
              throw new Error(SETS_MESSAGES.SOME_SET_NOT_FOUND)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const deleteSetForWorkoutDetailValidator = validate(
  checkSchema(
    {
      ids: {
        notEmpty: true,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            //FInd health plan details in database
            const health_plan_detail = await databaseService.healthPlanDetails.findOne({
              _id: new ObjectId(req.params!.id)
            })
            if (!health_plan_detail) {
              throw new Error(HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND)
            }
            // Find Item in workout details
            let count = 0
            value.forEach((item: string) => {
              const isExist = health_plan_detail?.workout_details?.find((detail) => detail._id!.toString() === item)
              if (isExist) {
                count++
              }
            })
            if (count !== value.length) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: SETS_MESSAGES.SOME_SET_NOT_FOUND
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

export const addMealForNutritionDetailValidator = validate(
  checkSchema(
    {
      meals: {
        notEmpty: true,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            //FInd Meal in database
            const meals = await databaseService.meals
              .find({
                _id: { $in: value.map((item: { id: string; orderNumber: number }) => new ObjectId(item.id)) }
              })
              .toArray()
            if (meals.length !== value.length) {
              throw new Error(MEALS_MESSAGES.SOME_MEALS_NOT_FOUND)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateItemStatusInNutritionDetailsValidator = validate(
  checkSchema(
    {
      meals: {
        optional: false,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            //FInd Set in database
            const meals = await databaseService.meals
              .find({
                _id: { $in: value.map((item: string) => new ObjectId(item)) }
              })
              .toArray()
            if (meals.length !== value.length) {
              throw new Error(MEALS_MESSAGES.SOME_MEALS_NOT_FOUND)
            }
            return true
          }
        }
      },
      status: {
        optional: false,
        isString: true,
        isIn: {
          options: [GeneralStatus],
          errorMessage: COMMON_MESSAGES.INVALID_STATUS
        }
      }
    },
    ['body']
  )
)

export const deleteMealForNutritionDetailValidator = validate(
  checkSchema(
    {
      ids: {
        notEmpty: true,
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            //FInd health plan details in database
            const health_plan_detail = await databaseService.healthPlanDetails.findOne({
              _id: new ObjectId(req.params!.id)
            })
            if (!health_plan_detail) {
              throw new Error(HEALTH_PLAN_DETAILS_MESSAGES.HEALTH_PLAN_DETAILS_NOT_FOUND)
            }
            // Find Item in nutrition details
            let count = 0
            value.forEach((item: string) => {
              const isExist = health_plan_detail?.nutrition_details?.find((detail) => detail._id!.toString() === item)
              if (isExist) {
                count++
              }
            })
            if (count !== value.length) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: MEALS_MESSAGES.SOME_MEALS_NOT_FOUND
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
