import { checkSchema, ParamSchema } from 'express-validator'
import { DATE_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const dateSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true, //Chặn định dạng YYYY-MM-Đ
      strictSeparator: true // KHông có chữ T trong chuỗi date string
    },
    errorMessage: DATE_MESSAGES.INVALID_DATE
  },
  optional: false,
  notEmpty: true
}

export const dateValidator = validate(
  checkSchema(
    {
      date: dateSchema
    },
    ['query']
  )
)
