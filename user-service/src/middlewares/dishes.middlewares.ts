import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISH_MESSAGES, INGREDIENT_MESSAGES } from '~/constants/messages'
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
export const dishesSearchByIngredientValidator = validate(
  checkSchema(
    {
      ingredients: {
        notEmpty: {
          errorMessage: 'Ingredients is required'
        },
        isString: true
      } // ingredient name
    },
    ['query']
  )
)

export const addDishValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: false,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.dishes.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: DISH_MESSAGES.DISH_EXISTS,
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
      calories: {
        notEmpty: true,
        isNumeric: true
      },
      prep_time: {
        notEmpty: true,
        isNumeric: true
      },
      rating: {
        notEmpty: true,
        isNumeric: true
      },
      image: {
        notEmpty: true,
        isString: true
      },
      instruction: {
        notEmpty: true,
        isString: true
      }
    },
    ['body']
  )
)
export const updateDishValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.dishes.findOne({
              name: value,
              _id: { $ne: new ObjectId(req.params?.id) }
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: DISH_MESSAGES.DISH_EXISTS,
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
      prep_time: {
        optional: true,
        isNumeric: true
      },
      rating: {
        optional: true,
        isNumeric: true
      },
      image: {
        optional: true,
        isString: true
      },
      instruction: {
        optional: true,
        isString: true
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
