import { JwtPayload } from 'jsonwebtoken'
import { ActivityLevel, Gender, LevelType, TokenType, UserRole, UserVerifyStatus } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'
export interface LoginReqBody {
  username?: string
  email?: string
  password: string
}
export interface LoginGoogleReqBody {
  email: string
  name?: string
  picture?: string
}

export interface RegisterReqBody {
  username: string
  email: string
  password: string
  confirm_password: string
}

export interface VerifyReqReqBody {
  email_verify_token: string
}

export interface LogoutReqBody {
  refresh_token: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  role: UserRole
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}
export interface ForgotPasswordReqBody {
  email: string
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}
export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface UpdateMeReqBody {
  username?: string
  fullName?: string
  date_of_birth?: string
  gender?: Gender
  avatar?: string
  height?: number
  weight?: number
  goal_weight?: number
  level?: LevelType
  activityLevel?: ActivityLevel
}
export interface ChangePasswordReqBody {
  old_password: string
  new_password: string
  confirm_password: string
}

export interface BanUserReqParams extends ParamsDictionary {
  user_id: string
}

export interface UpdateUserNotifySettingsReqBody {
  isChallenge?: boolean
  isEating?: boolean
  isWorkout?: boolean
  isWater?: boolean
  isAdmin?: boolean
  isHealth?: boolean
}
