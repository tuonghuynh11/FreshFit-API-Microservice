import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { INGREDIENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const ingredientsSearchValidator = validate(
  checkSchema(
    {
      search: {
        notEmpty: true,
        isString: true
      } // ingredient name
    },
    ['query']
  )
)

export const addIngredientValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: false,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.ingredients.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: INGREDIENT_MESSAGES.INGREDIENT_EXISTS,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      },
      description: {
        notEmpty: true,
        trim: true
      },
      calories: {
        notEmpty: true,
        isNumeric: true
      },
      image: {
        notEmpty: true,
        isString: true
      },
      cab: {
        optional: true,
        isNumeric: true
      },

      sodium: {
        optional: true,
        isNumeric: true
      },

      sugar: {
        optional: true,
        isNumeric: true
      },

      cholesterol: {
        optional: true,
        isNumeric: true
      },

      fat: {
        optional: true,
        isNumeric: true
      }
    },
    ['body']
  )
)
export const updateIngredientValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.ingredients.findOne({
              name: value,
              _id: { $ne: new ObjectId(req.params?.id) }
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: INGREDIENT_MESSAGES.INGREDIENT_EXISTS,
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
      calories: {
        optional: true,
        isNumeric: true
      },
      image: {
        optional: true,
        isString: true
      },
      cab: {
        optional: true,
        isNumeric: true
      },

      sodium: {
        optional: true,
        isNumeric: true
      },

      sugar: {
        optional: true,
        isNumeric: true
      },

      cholesterol: {
        optional: true,
        isNumeric: true
      },

      fat: {
        optional: true,
        isNumeric: true
      }
    },
    ['body']
  )
)
