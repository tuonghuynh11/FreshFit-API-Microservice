import { checkSchema } from 'express-validator'
import { NotificationType } from '~/constants/enums'
import { NOTIFICATION_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const notificationsSearchValidator = validate(
  checkSchema(
    {
      type: {
        optional: true,
        isString: true
      },
      search: {
        optional: true,
        isString: true
      } // post title
    },
    ['query']
  )
)
export const createNotificationValidator = validate(
  checkSchema(
    {
      title: {
        notEmpty: true,
        trim: true
      },
      message: {
        notEmpty: true,
        trim: true
      },
      type: {
        notEmpty: true,
        isString: true,
        isIn: {
          options: [NotificationType],
          errorMessage: NOTIFICATION_MESSAGES.INVALID_NOTIFICATION_TYPE
        }
      },
      action: {
        optional: true,
        trim: true
      }
    },
    ['body']
  )
)
