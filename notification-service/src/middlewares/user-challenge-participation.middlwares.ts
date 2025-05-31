import { checkSchema } from 'express-validator'
import { UserChallengeParticipationQueryTypeFilter } from '~/constants/enums'
import { COMMON_MESSAGES, USER_CHALLENGE_PARTICIPATION_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const userChallengeParticipationSearchValidator = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: true
      }, // challenge name

      status: {
        optional: false,
        notEmpty: true,
        isString: true,
        isIn: {
          options: [UserChallengeParticipationQueryTypeFilter],
          errorMessage: USER_CHALLENGE_PARTICIPATION_MESSAGES.INVALID_USER_CHALLENGE_PARTICIPATION_STATUS
        }
      }
    },
    ['query']
  )
)
export const updateProgressEachDayValidator = validate(
  checkSchema(
    {
      completed_workouts: {
        notEmpty: false,
        isArray: true
      },
      completed_nutritions: {
        notEmpty: false,
        isArray: true
      }
    },
    ['body']
  )
)
export const getUserChallengeProgressValidator = validate(
  checkSchema(
    {
      week: {
        optional: true,
        isNumeric: true
      },
      day: {
        optional: true,
        isNumeric: true
      }
    },
    ['query']
  )
)
export const startChallengeValidator = validate(
  checkSchema(
    {
      start_date: {
        notEmpty: true,
        isISO8601: {
          options: {
            strict: true, //Chặn định dạng YYYY-MM-Đ
            strictSeparator: true // KHông có chữ T trong chuỗi date string
          },
          errorMessage: COMMON_MESSAGES.DATE_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)
