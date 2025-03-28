import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, PostStatus, PostType, ReactionType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { POST_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createPostValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!isExist) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      type: {
        notEmpty: true,
        isString: true,
        isIn: {
          options: [PostType],
          errorMessage: POST_MESSAGES.INVALID_POST_TYPE
        }
      },
      title: {
        notEmpty: true,
        trim: true
      },

      content: {
        notEmpty: true,
        trim: true
      },
      medias: {
        isArray: true,
        notEmpty: false
      },
      mediaType: {
        notEmpty: false,
        isString: true,
        isIn: {
          options: [MediaType],
          errorMessage: POST_MESSAGES.INVALID_MEDIA_TYPE
        }
      },
      tags: {
        isArray: true,
        notEmpty: false
      },
      status: {
        optional: true,
        isString: true,
        isIn: {
          options: [PostStatus],
          errorMessage: POST_MESSAGES.INVALID_POST_STATUS
        }
      }
    },
    ['body']
  )
)
export const updatePostValidator = validate(
  checkSchema(
    {
      type: {
        optional: true,
        isString: true,
        isIn: {
          options: [PostType],
          errorMessage: POST_MESSAGES.INVALID_POST_TYPE
        }
      },
      title: {
        optional: true,
        trim: true
      },
      content: {
        optional: true,
        trim: true
      },
      medias: {
        optional: true,
        isArray: true
      },
      mediaType: {
        optional: true,
        isString: true,
        isIn: {
          options: [MediaType],
          errorMessage: POST_MESSAGES.INVALID_MEDIA_TYPE
        }
      },
      tags: {
        optional: true,
        isArray: true
      },
      status: {
        optional: true,
        isString: true
      }
    },
    ['body']
  )
)
export const postsSearchValidator = validate(
  checkSchema(
    {
      type: {
        optional: true,
        isString: true
      },
      search: {
        optional: true,
        isString: true
      }, // post title
      status: {
        optional: true,
        isString: true
      },
      tags: {
        optional: true,
        isString: true
      }
    },
    ['query']
  )
)
export const rejectPostValidator = validate(
  checkSchema(
    {
      comment: {
        notEmpty: true,
        isString: true
      },
      medias: {
        optional: true,
        isArray: true
      }
    },
    ['body']
  )
)
export const updatePostFeedbackValidator = validate(
  checkSchema(
    {
      comment: {
        optional: true,
        isString: true
      },
      medias: {
        optional: true,
        isArray: true
      },
      status: {
        optional: true,
        isString: true
      }
    },
    ['body']
  )
)
export const reactPostValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!isExist) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      reaction: {
        notEmpty: true,
        isString: true,
        isIn: {
          options: [ReactionType],
          errorMessage: POST_MESSAGES.INVALID_POST_REACTION_TYPE
        }
      }
    },
    ['body']
  )
)
