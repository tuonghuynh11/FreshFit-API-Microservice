import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { INGREDIENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const dishesSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      } // dish name
    },
    ['query']
  )
)

export const addChatRoomValidator = validate(
  checkSchema(
    {
      user1: {
        notEmpty: true,
        trim: true,
        isString: true
      },
      user2: {
        notEmpty: true,
        trim: true,
        isString: true
      }
    },
    ['body']
  )
)
export const sendMessageValidator = validate(
  checkSchema(
    {
      message: {
        notEmpty: true,
        isString: true,
        trim: true
      },
      image: {
        optional: true,
        isString: true,
        trim: true
      }
    },
    ['body']
  )
)
export const updateDishIngredientValidator = validate(
  checkSchema(
    {
      ingredientId: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.ingredients.findOne({
              _id: new ObjectId(value)
            })
            if (!isExist) {
              throw new ErrorWithStatus({
                message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      quantity: {
        optional: true,
        isNumeric: true
      },
      unit: {
        optional: true,
        isString: true
      }
    },
    ['body']
  )
)

export const addDishIngredientValidator = validate(
  checkSchema(
    {
      ingredientId: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.ingredients.findOne({
              _id: new ObjectId(value)
            })
            if (!isExist) {
              throw new ErrorWithStatus({
                message: INGREDIENT_MESSAGES.INGREDIENT_NOT_FOUND,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      quantity: {
        notEmpty: true,
        isNumeric: true
      },
      unit: {
        notEmpty: true,
        isString: true
      }
    },
    ['body']
  )
)
