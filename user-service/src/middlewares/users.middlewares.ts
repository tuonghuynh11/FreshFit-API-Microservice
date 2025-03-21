import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { Gender, LevelType, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { verifyAccessToken } from '~/utils/commons'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS_LONG_AND_CONTAIN_AT_LEAST_1_LOWERCASE_1_UPPERCASE_1_NUMBER_AND_1_SYMBOL
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  }
}
const confirmPasswordSchema = (key: string): ParamSchema => {
  return {
    notEmpty: {
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isString: {
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      },
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    isLength: {
      options: {
        min: 6,
        max: 50
      },
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body[key]) {
          throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_EQUAL_TO_PASSWORD)
        }
        return true
      }
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken
        })
        const { user_id, otp_code } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({
          _id: new ObjectId(user_id)
        })

        if (!user) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: 'Forgot Password Token Error:' + capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}
const otpCodeSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      const user = await databaseService.users.findOne({
        email: req.body.email
      })

      if (!user) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      if (new Date(user.otp!.expired_at) < new Date()) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.OTP_CODE_EXPIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }

      if (user.otp?.code !== value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_OTP_CODE,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      req.user = user

      await databaseService.users.updateOne(
        {
          email: req.body.email
        },
        {
          $set: {
            otp: undefined
          }
        }
      )

      return true
    }
  }
}
const verifyEmailOtpCodeSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.OTP_CODE_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      const user = await databaseService.users.findOne({
        email: req.body.email
      })

      if (!user) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      if (new Date(user.otp!.expired_at) < new Date()) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.OTP_CODE_EXPIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }

      if (user.otp?.code !== value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_OTP_CODE,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      req.user = user
      return true
    }
  }
}
const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400
  }
}
const nameSchema: ParamSchema = {
  optional: true,
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true, //Chặn định dạng YYYY-MM-Đ
      strictSeparator: true // KHông có chữ T trong chuỗi date string
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({
        _id: new ObjectId(value)
      })
      if (!followed_user) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // if (
      //   followed_user.verify === UserVerifyStatus.Unverified ||
      //   followed_user.verify === UserVerifyStatus.Banned
      // ) {
      //   throw new ErrorWithStatus({
      //     message: USERS_MESSAGES.FOLLOW_USER_NOT_VERIFIED_OR_BANED,
      //     status: HTTP_STATUS.FORBIDDEN
      //   })
      // }
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email_or_username: {
        notEmpty: false,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new Error(USERS_MESSAGES.MISSING_EMAIL_OR_USERNAME)
            }

            //FInd User in database
            const [user_email, user_username] = await Promise.all([
              databaseService.users.findOne({
                email: value,
                password: hashPassword(req.body.password)
              }),
              databaseService.users.findOne({
                username: value,
                password: hashPassword(req.body.password)
              })
            ])
            if (!user_email && !user_username) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user_email ? user_email : user_username
            return true
          }
        },
        trim: true
      },

      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS_LONG_AND_CONTAIN_AT_LEAST_1_LOWERCASE_1_UPPERCASE_1_NUMBER_AND_1_SYMBOL
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      username: {
        notEmpty: false,
        trim: true,
        custom: {
          options: (value, { req }) => {
            return true
          }
        }
      },
      email: {
        notEmpty: false,
        isEmail: {
          errorMessage: 'Invalid Email'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await userService.checkEmailExists(value)
            if (isExist) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return Boolean(isExist)
          }
        }
      },
      password: {
        notEmpty: true,
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minSymbols: 1,
            minNumbers: 1,
            minUppercase: 1
          },
          errorMessage:
            'Password must be at least 8 chars long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
        },
        isString: true,
        isLength: {
          errorMessage: 'Password must be at least 6 chars long',
          options: { min: 6, max: 50 }
        },
        trim: true
      },
      confirm_password: {
        notEmpty: true,
        isString: true,
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minSymbols: 1,
            minNumbers: 1,
            minUppercase: 1
          },
          errorMessage:
            'Password must be at least 8 chars long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password confirmation does not match password')
            }
            return true
          }
        },
        trim: true
      }
    },
    ['body']
  )
)
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const access_token = (value || '').split(' ')[1]
            return await verifyAccessToken(access_token, req as Request)
            // if (!access_token) {
            //   throw new ErrorWithStatus({
            //     message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
            //     status: HTTP_STATUS.UNAUTHORIZED
            //   })
            // }
            // try {
            //   const decoded_authorization = await verifyToken({
            //     token: access_token,
            //     secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN
            //   })
            //   ;(req as Request).decoded_authorization = decoded_authorization
            // } catch (error) {
            //   throw new ErrorWithStatus({
            //     message: 'Access Token Error:' + capitalize((error as JsonWebTokenError).message),
            //     status: HTTP_STATUS.UNAUTHORIZED
            //   })
            // }

            // return true
          }
        }
      }
    },
    ['headers']
  )
)
export const adminRoleValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const { role } = req.decoded_authorization as TokenPayload
            if (role !== UserRole.Admin) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_PERMISSION_FOR_THIS_ACTION,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_Token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: envConfig.jwtSecretRefreshToken }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (!refresh_Token) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: 'Refresh Token Error:' + capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretEmailVerifyToken
              })

              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: 'Email Verification Error: ' + capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
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
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_NOT_VALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)
export const verifyOTPCodeValidator = validate(
  checkSchema(
    {
      otp_code: otpCodeSchema
    },
    ['body']
  )
)
export const verifyEmailValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_NOT_VALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.user = user
            return true
          }
        }
      },
      otp_code: verifyEmailOtpCodeSchema
    },
    ['body']
  )
)

export const resetPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
      // password: passwordSchema,
      // confirm_password: confirmPasswordSchema('password')
    },
    ['body']
  )
)
export const verifiedUSerValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
export const updateMeValidator = validate(
  checkSchema(
    {
      username: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ username: value })
            if (user && user._id.toString() !== req.decoded_authorization.user_id.toString()) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      },
      fullName: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      gender: {
        isNumeric: {
          errorMessage: USERS_MESSAGES.GENDER_MUST_BE_A_NUMBER
        },
        optional: true,
        custom: {
          options: async (value, { req }) => {
            const isGenderValid =
              Object.values(Gender).filter((item: Gender, index: number) => index === value).length !== 0
            if (!isGenderValid) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_GENDER,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      },
      avatar: imageSchema,
      height: {
        optional: true,
        isNumeric: {
          errorMessage: USERS_MESSAGES.HEIGHT_MUST_BE_A_NUMBER
        }
      },
      weight: {
        optional: true,
        isNumeric: {
          errorMessage: USERS_MESSAGES.WEIGHT_MUST_BE_A_NUMBER
        }
      },
      goal_weight: {
        optional: true,
        isNumeric: {
          errorMessage: USERS_MESSAGES.GOAL_WEIGHT_MUST_BE_A_NUMBER
        }
      },
      level: {
        isNumeric: {
          errorMessage: USERS_MESSAGES.LEVEL_MUST_BE_A_NUMBER
        },
        optional: true,
        custom: {
          options: async (value, { req }) => {
            const isLevelValid =
              Object.values(LevelType).filter((item: LevelType, index: number) => index === value).length !== 0
            if (!isLevelValid) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_LEVEL,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      },
      activityLevel: {
        isString: true,
        optional: true
      }
    },
    ['body']
  )
)
export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const isOldPassword = user.password === hashPassword(value)
            if (!isOldPassword) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.OLD_PASSWORD_IS_INCORRECT,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      },
      new_password: passwordSchema,
      confirm_password: confirmPasswordSchema('new_password')
    },
    ['body']
  )
)

export const updateUserNotifyValidator = validate(
  checkSchema(
    {
      isChallenge: {
        optional: true,
        isBoolean: true
      },
      isEating: {
        optional: true,
        isBoolean: true
      },
      isWorkout: {
        optional: true,
        isBoolean: true
      },
      isWater: {
        optional: true,
        isBoolean: true
      },
      isAdmin: {
        optional: true,
        isBoolean: true
      },
      isHealth: {
        optional: true,
        isBoolean: true
      }
    },
    ['body']
  )
)

export const verifiedAdminValidator = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.decoded_authorization as TokenPayload
  if (role !== UserRole.Admin) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_PERMISSION_FOR_THIS_ACTION,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
export const userBannedValidator = async (req: Request, res: Response, next: NextFunction) => {
  const user = await databaseService.users.findOne({ _id: new ObjectId(req.user?._id) })
  if (user?.status === UserStatus.Ban) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_IS_BANNED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }

  next()
}
export const userIsOnlineValidator = async (req: Request, res: Response, next: NextFunction) => {
  const user = await databaseService.users.findOne({ _id: new ObjectId(req.user?._id) })
  if (user?.isOnline) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_IS_ONLINE,
        status: HTTP_STATUS.CONFLICT
      })
    )
  }

  next()
}
