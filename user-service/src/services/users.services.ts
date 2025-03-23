import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import {
  CreateExpertUserBody,
  RegisterReqBody,
  UpdateMeReqBody,
  UpdateUserNotifySettingsReqBody
} from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import {
  GoalDetailStatus,
  HealthActivityQueryType,
  HealthTrackingType,
  TokenType,
  UserRole,
  UserStatus,
  UserVerifyStatus
} from '~/constants/enums'
import { envConfig } from '~/constants/config'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ClientSession, ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import axios from 'axios'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { sendForgotPasswordEmail, sendVerifyEmail } from '~/utils/mails'
import OTP from '~/models/schemas/Otp.schema'
import { generateExpertUniqueUsername, generateOTP, generatePassword, IsEmailExist } from '~/utils/commons'
import { GoalDetail } from '~/models/schemas/GoalDetail.schema'
import appointmentService from './appointment.services'

class UserService {
  private signAccessToken({ user_id, role, verify }: { user_id: string; role: UserRole; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        role: role,
        token_type: TokenType.AccessToken,
        verify: verify
      },
      privateKey: envConfig.jwtSecretAccessToken,
      options: {
        algorithm: 'HS256',
        expiresIn: envConfig.accessTokenExpiresIn
      }
    })
  }

  private signRefreshToken({
    user_id,
    role,
    verify,
    exp
  }: {
    user_id: string
    role: UserRole
    verify: UserVerifyStatus
    exp?: number
  }) {
    return signToken({
      payload: {
        user_id,
        role: role,
        token_type: TokenType.RefreshToken,
        verify: verify
      },
      privateKey: envConfig.jwtSecretRefreshToken,
      options: {
        algorithm: 'HS256',
        expiresIn: exp || envConfig.refreshTokenExpiresIn
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify: verify
      },
      privateKey: envConfig.jwtSecretEmailVerifyToken,
      options: {
        algorithm: 'HS256',
        expiresIn: envConfig.emailVerifyTokenExpiresIn
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify: verify
      },
      privateKey: envConfig.jwtSecretForgotPasswordToken,
      options: {
        algorithm: 'HS256',
        expiresIn: envConfig.forgotPasswordTokenExpiresIn
      }
    })
  }
  private signAccessTokenAndRefreshToken({
    user_id,
    verify,
    role,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: UserRole
    exp?: number
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, role, verify, exp })
    ])
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken as string
    })
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    // const email_verify_token = await this.signEmailVerifyToken({
    //   user_id: user_id.toString(),
    //   verify: UserVerifyStatus.Unverified
    // })
    const otp_code = generateOTP(4)
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        // email_verify_token: email_verify_token,
        _id: user_id,
        role: UserRole.User,
        password: hashPassword(payload.password),
        otp: new OTP({
          code: otp_code,
          expired_at: new Date(Date.now() + 5 * 60000)
        })
      })
    )
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
      role: UserRole.User
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), iat, exp })
    )

    // console.log('email_verify_token', email_verify_token)
    console.log('OTP code: ', otp_code)
    sendVerifyEmail({ email: payload.email, otp_code: otp_code })
    return { access_token, refresh_token }
  }
  async checkEmailExists(email: string) {
    const isExist = await databaseService.users.findOne({ email: email })
    return Boolean(isExist)
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email: email })
    return Boolean(user)
  }
  async login({ user_id, verify, user_role }: { user_id: string; verify: UserVerifyStatus; user_role: UserRole }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify: verify,
      role: user_role
    })
    databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },

      {
        $currentDate: {
          updated_at: true
        }
      }
    )

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), iat, exp })
    )
    return { access_token, refresh_token }
  }
  async loginByGoogle({ email, name, picture }: { email: string; name?: string; picture?: string }) {
    const user = await databaseService.users.findOne({ email: email })
    let user_id: string = ''
    let verify: number = -1
    let role: number = -1

    if (user) {
      user_id = user._id.toString()
      verify = user.verify as UserVerifyStatus
      role = user.role as UserRole
    } else {
      const _id = new ObjectId()
      user_id = _id.toString()
      verify = UserVerifyStatus.Verified
      role = UserRole.User
      const result = await databaseService.users.insertOne(
        new User({
          _id,
          email,
          role: UserRole.User,
          verify: UserVerifyStatus.Verified,
          password: hashPassword(generatePassword(10)),
          username: name,
          avatar: picture
        })
      )
    }

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify,
      role
    })

    databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },

      {
        $currentDate: {
          updated_at: true
        }
      }
    )
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), iat, exp })
    )

    return { access_token, refresh_token }
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      // client_id: envConfig.googleClientId,
      // client_secret: envConfig.googleClientSecret,
      // redirect_uri: envConfig.googleRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: 'Bearer ' + id_token
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)

    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    //Check email exist in database
    const user = await databaseService.users.findOne({ email: userInfo.email })
    //If email exist in database, login to application
    if (user) {
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify as UserVerifyStatus,
        role: UserRole.User
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)

      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ token: refresh_token, user_id: user._id, iat, exp })
      )
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    } else {
      //random string password
      const password = Math.random().toString(36).substring(2, 30)
      //không có thì tạo mới tài khoản
      const data = await this.register({
        username: userInfo.name,
        email: userInfo.email,
        password: hashPassword(password),
        confirm_password: hashPassword(password)
      })
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }
  async logout(refresh_token: string) {
    const { user_id } = await this.decodeRefreshToken(refresh_token)
    databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },

      {
        $set: {
          isOnline: false
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
  async refreshToken({
    old_refresh_token,
    user_id,
    role,
    verify,
    exp
  }: {
    old_refresh_token: string
    user_id: string
    role: UserRole
    verify: UserVerifyStatus
    exp: number
  }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, role, verify, exp })
    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token)

    await Promise.all([
      databaseService.refreshTokens.deleteOne({ token: old_refresh_token }),
      databaseService.refreshTokens.insertOne(
        new RefreshToken({
          token: refresh_token,
          user_id: new ObjectId(user_id),
          iat: decoded_refresh_token.iat,
          exp: decoded_refresh_token.exp
        })
      )
    ])
    return { access_token, refresh_token }
  }

  async verifyEmail(user_id: string, role: UserRole) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({ user_id, role: role, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          // $set: {
          //   email_verify_token: '',
          //   verify: UserVerifyStatus.Verified
          //   // updated_at: new Date() //Thời gian chạy câu lệnh này
          // },
          $set: {
            otp: null,
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW' //Thời gian mà mongodb cập nhật
          }
          // $currentDate: {
          //   updated_at: true //Thời gian mà mongodb cập nhật
          // }
        }
      ])
    ])
    const [access_token, refresh_token] = token
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), iat, exp })
    )
    return { access_token, refresh_token }
  }

  async resendVerifyEmail(user_id: string, email: string) {
    // const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    console.log('Resend verify email: ', user_id)
    const otpCode = generateOTP(4)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          otp: new OTP({
            code: otpCode,
            expired_at: new Date(Date.now() + 5 * 60000)
          })
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    //Cập nhật lại email_verify_token trong document
    // await databaseService.users.updateOne(
    //   { _id: new ObjectId(user_id) },
    //   {
    //     $set: {
    //       email_verify_token: email_verify_token
    //     },
    //     $currentDate: {
    //       updated_at: true //Thời gian mà mongodb cập nhật
    //     }
    //   }
    // )
    sendVerifyEmail({ email: email, otp_code: otpCode })
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, email }: { user_id: string; email: string }) {
    const otpCode = generateOTP(4)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          otp: new OTP({
            code: otpCode,
            expired_at: new Date(Date.now() + 5 * 60000)
          })
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    sendForgotPasswordEmail({ email: email, otp_code: otpCode })
    console.log('forgot password token:', otpCode)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            otp: null,
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async verifyForgotPasswordToken(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify: UserVerifyStatus.Unverified })
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return forgot_password_token
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // Trả về giá trị mới
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    return user
  }
  async updateUserNotifySettings(user_id: string, payload: UpdateUserNotifySettingsReqBody) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          myNotifySettings: {
            ...payload
          }
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // Trả về giá trị mới
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return result
  }
  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORDS_SUCCESS
    }
  }

  async banUser(user_id: string) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          status: UserStatus.Ban
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // Trả về giá trị mới
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async unBanUser(user_id: string) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          status: UserStatus.Normal
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // Trả về giá trị mới
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async getAllUsers({ page, limit, isBan }: { page: number; limit: number; isBan?: number }) {
    if (isBan === 0 || isBan === 1) {
      const [users, totalUsers] = await Promise.all([
        databaseService.users
          .aggregate([
            {
              $project: {
                password: 0
              }
            },
            {
              $match: {
                status: isBan ? UserStatus.Ban : UserStatus.Normal
              }
            },
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            }
          ])
          .toArray(),
        databaseService.users
          .aggregate([
            {
              $match: {
                status: isBan ? UserStatus.Ban : UserStatus.Normal
              }
            }
          ])
          .toArray()
      ])
      return {
        users: users,
        total: totalUsers.length
      }
    } else {
      const [users, totalUsers] = await Promise.all([
        databaseService.users
          .aggregate([
            {
              $project: {
                password: 0
              }
            },
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            }
          ])
          .toArray(),
        databaseService.users.find().toArray()
      ])
      return {
        users: users,
        total: totalUsers.length
      }
    }
  }
  async getHealthActivity({ type, date, user_id }: { type: HealthActivityQueryType; date: string; user_id: string }) {
    //date
    // Get By Year: "2021"
    // Get By Month: "2021-09"
    // Get By Day: "2021-09-01"
    const healthTrackings = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'health_trackings',
            localField: 'healthTrackings',
            foreignField: '_id',
            as: 'healthTrackings',
            pipeline: [
              {
                $match: {
                  date: {
                    $regex: date,
                    $options: 'i'
                  }
                }
              }
            ]
          }
        },
        { $project: { healthTrackings: 1, _id: 0 } },
        { $unwind: { path: '$healthTrackings' } },
        {
          $replaceRoot: {
            newRoot: '$healthTrackings'
          }
        }
      ])
      .toArray()
    healthTrackings.sort((a, b) => b.date.localeCompare(a.date))
    let water: any = []
    // const consumed: any = {}
    // const burned: any = {}
    let consumed: any = []
    let burned: any = []

    if (type === HealthActivityQueryType.All) {
      // const temp1 = healthTrackings.find((item: any) => item.type === HealthTrackingType.Calories_Consumed)
      // const temp2 = healthTrackings.find((item: any) => item.type === HealthTrackingType.Calories_Burned)

      // consumed._id = temp1?._id.toString() // Health Tracking ID
      // consumed.target = temp1?.target
      // consumed.value = temp1?.value
      // consumed.date = temp1?.date

      // burned._id = temp2?._id.toString() // Health Tracking ID
      // burned.target = temp2?.target
      // burned.value = temp2?.value
      // burned.date = temp2?.date

      // water = await databaseService.waters.findOne({
      //   user_id: new ObjectId(user_id),
      //   date: {
      //     $regex: date,
      //     $options: 'i'
      //   }
      // })

      const temp1 = healthTrackings.filter((item: any) => item.type === HealthTrackingType.Calories_Consumed)
      const temp2 = healthTrackings.filter((item: any) => item.type === HealthTrackingType.Calories_Burned)
      consumed = temp1
      burned = temp2
      water = (
        await databaseService.waters
          .find({
            user_id: new ObjectId(user_id),
            date: {
              $regex: date,
              $options: 'i'
            }
          })
          .toArray()
      ).sort((a, b) => b.date.localeCompare(a.date))
    } else if (type === HealthActivityQueryType.Water) {
      // water = await databaseService.waters.findOne({
      //   user_id: new ObjectId(user_id),
      //   date: {
      //     $regex: date,
      //     $options: 'i'
      //   }
      // })
      water = (
        await databaseService.waters
          .find({
            user_id: new ObjectId(user_id),
            date: {
              $regex: date,
              $options: 'i'
            }
          })
          .toArray()
      ).sort((a, b) => b.date.localeCompare(a.date))
    } else if (type === HealthActivityQueryType.Consumed) {
      // const temp1 = healthTrackings.find((item: any) => item.type === HealthTrackingType.Calories_Consumed)
      // consumed._id = temp1?._id.toString() // Health Tracking ID
      // consumed.target = temp1?.target
      // consumed.value = temp1?.value
      // consumed.date = temp1?.date
      const temp1 = healthTrackings.filter((item: any) => item.type === HealthTrackingType.Calories_Consumed)
      consumed = temp1
    } else {
      // const temp2 = healthTrackings.find((item: any) => item.type === HealthTrackingType.Calories_Burned)
      // burned._id = temp2?._id.toString() // Health Tracking ID
      // burned.target = temp2?.target
      // burned.value = temp2?.value
      // burned.date = temp2?.date
      const temp2 = healthTrackings.filter((item: any) => item.type === HealthTrackingType.Calories_Burned)
      burned = temp2
    }

    return {
      water,
      consumed,
      burned
    }
  }

  async startGoal({ user_id }: { user_id: string }) {
    const date = new Date()
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const update: GoalDetail = {
      ...user.goalDetail,
      goal: user.goalDetail!.goal!,
      startDate: date,
      targetDate: new Date(date.getTime() + 60 * 24 * 60 * 60 * 1000),
      status: GoalDetailStatus.InProgress,
      updated_at: date,
      progress: user.goalDetail?.progress || 0
    }
    await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          goalDetail: update
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // Trả về giá trị mới
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }
  async updateGoalStatus({ user_id, status }: { user_id: string; status: GoalDetailStatus }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          'goalDetail.status': status
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // Trả về giá trị mới
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    user.goalDetail!.status = status as GoalDetailStatus
    return user
  }

  async checkUserExited(user_id: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })

    return user
  }
  async createExpertUser(expert: CreateExpertUserBody) {
    const existedEmail = await IsEmailExist(expert.email)
    if (existedEmail) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const session: ClientSession = databaseService.startSession()

    let userId: string | null = null
    try {
      await session.withTransaction(async () => {
        const username = await generateExpertUniqueUsername()
        const newExpertUser = new User({
          fullName: expert.fullName,
          email: expert.email,
          phoneNumber: expert.phoneNumber,
          date_of_birth: new Date(expert.dateOfBirth),
          password: hashPassword(envConfig.defaultExpertPassword),
          verify: UserVerifyStatus.Verified,
          gender: expert.gender,
          role: UserRole.Expert,
          username,
          avatar: expert.avatar
        })

        // Insert User into MongoDB
        const result = await databaseService.users.insertOne(newExpertUser, { session })
        if (!result.insertedId) throw new Error('Failed to insert user')

        userId = result.insertedId.toString() // Store userId for rollback if needed
      })

      // Now call the external service (outside the MongoDB transaction)
      const expertInfo = await appointmentService.createExpert({
        userId: userId!,
        ...expert
      })

      return {
        id: userId,
        ...expert
      }
    } catch (error) {
      // If external service fails, rollback by deleting the user from MongoDB
      if (userId) {
        await databaseService.users.deleteOne({ _id: new ObjectId(userId) })
        console.log(`Rolled back: Deleted user ${userId}`)
      }

      throw new Error('Failed to create expert user, transaction rolled back')
    } finally {
      session.endSession()
    }
  }
}

const userService = new UserService()
export default userService
