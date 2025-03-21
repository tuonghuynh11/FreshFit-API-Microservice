import { checkSchema } from 'express-validator'
import { ChallengeQueryTypeFilter, ChallengeTarget, ChallengeType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { CHALLENGE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const challengeSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // challenge name

      type: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [ChallengeQueryTypeFilter],
          errorMessage: CHALLENGE_MESSAGES.INVALID_CHALLENGE_TYPE
        }
      }
    },
    ['query']
  )
)

export const addChallengeValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: false,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.challenges.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: CHALLENGE_MESSAGES.CHALLENGE_EXISTS,
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
      type: {
        notEmpty: true,
        isString: true,
        isIn: {
          options: [ChallengeType],
          errorMessage: CHALLENGE_MESSAGES.INVALID_CHALLENGE_TYPE
        }
      },
      prize_image: {
        notEmpty: true,
        isString: true
      },
      prize_title: {
        notEmpty: true,
        isString: true
      },
      target: {
        notEmpty: true,
        isString: true,
        isIn: {
          options: [ChallengeTarget],
          errorMessage: CHALLENGE_MESSAGES.INVALID_CHALLENGE_TARGET
        }
      },
      target_image: {
        notEmpty: false,
        isString: true
      },
      fat_percent: {
        notEmpty: false,
        isNumeric: true
      },
      weight_loss_target: {
        notEmpty: false,
        isNumeric: true
      },
      image: {
        notEmpty: true,
        isString: true
      },
      start_date: {
        optional: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: CHALLENGE_MESSAGES.START_DATE_MUST_BE_ISO8601
        }
      },
      end_date: {
        optional: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: CHALLENGE_MESSAGES.END_DATE_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)
export const updateChallengesValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.challenges.findOne({
              name: value
            })
            if (isExist) {
              throw new ErrorWithStatus({
                message: CHALLENGE_MESSAGES.CHALLENGE_EXISTS,
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
      type: {
        optional: true,
        isString: true,
        isIn: {
          options: [ChallengeType],
          errorMessage: CHALLENGE_MESSAGES.INVALID_CHALLENGE_TYPE
        }
      },
      prize_image: {
        optional: true,
        isString: true
      },
      prize_title: {
        optional: true,
        isString: true
      },
      target: {
        optional: true,
        isString: true,
        isIn: {
          options: [ChallengeTarget],
          errorMessage: CHALLENGE_MESSAGES.INVALID_CHALLENGE_TARGET
        }
      },
      target_image: {
        optional: true,
        isString: true
      },
      fat_percent: {
        optional: true,
        isNumeric: true
      },
      weight_loss_target: {
        optional: true,
        isNumeric: true
      },
      image: {
        optional: true,
        isString: true
      },
      start_date: {
        optional: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: CHALLENGE_MESSAGES.START_DATE_MUST_BE_ISO8601
        }
      },
      end_date: {
        optional: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: CHALLENGE_MESSAGES.END_DATE_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)
