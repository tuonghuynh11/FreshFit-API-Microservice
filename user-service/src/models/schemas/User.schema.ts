import { ObjectId } from 'mongodb'
import { UserNotifySettings } from '~/constants/classes'
import { ActivityLevel, Gender, LevelType, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enums'
import Challenges from './Challenges.schema'
import OTP from './Otp.schema'
import { GoalDetail } from './GoalDetail.schema'

// Swagger UI Express Comment Format

interface UserType {
  _id?: ObjectId
  fullName?: string
  email?: string
  phoneNumber?: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus
  gender?: Gender //
  role?: UserRole
  username?: string // optional
  avatar?: string // optional
  status?: UserStatus
  height?: number
  weight?: number
  goal_weight?: number
  level?: LevelType
  activityLevel?: ActivityLevel
  myNotifySettings?: UserNotifySettings
  workout_plans?: ObjectId[]
  meals?: ObjectId[]
  waters?: ObjectId[]
  challenges?: Challenges[]
  isOnline?: boolean
  otp?: OTP
  healthTrackings?: ObjectId[]
  goalDetail?: GoalDetail
  fcmToken?: string
  zegoToken?: string // token video call
}

export default class User {
  _id?: ObjectId
  fullName?: string
  email?: string
  phoneNumber?: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus
  gender?: Gender
  role?: UserRole
  username?: string // optional
  avatar?: string // optional
  status?: UserStatus
  height?: number
  weight?: number
  goal_weight?: number
  activityLevel?: ActivityLevel
  level?: LevelType

  myNotifySettings?: UserNotifySettings
  workout_plans?: ObjectId[]
  meals?: ObjectId[]
  waters?: ObjectId[]
  caloriesTakeInTargets?: ObjectId[]
  caloriesBurnTargets?: ObjectId[]
  challenges: Challenges[]
  isOnline?: boolean
  otp?: OTP
  healthTrackings?: ObjectId[]
  goalDetail?: GoalDetail
  fcmToken?: string
  zegoToken?: string // token video call

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.fullName = user.fullName || ''
    this.email = user.email || ''
    this.phoneNumber = user.phoneNumber || ''
    this.date_of_birth = user.date_of_birth || undefined
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.role = user.role || UserRole.User
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.status = user.status || UserStatus.Normal
    this.height = user.height
    this.weight = user.weight
    this.goal_weight = user.goal_weight
    this.level = user.level || LevelType.Beginner
    this.myNotifySettings = user.myNotifySettings || new UserNotifySettings()
    this.workout_plans = user.workout_plans || []
    this.meals = user.meals || []
    this.waters = user.waters || []
    this.challenges = user.challenges || []
    this.isOnline = user.isOnline || false
    this.otp = user.otp
    this.healthTrackings = user.healthTrackings || []
    this.goalDetail = user.goalDetail
    this.activityLevel = user.activityLevel || ActivityLevel.Sedentary
    this.fcmToken = user.fcmToken || ''
    this.zegoToken = user.zegoToken || ''
    this.gender = user.gender || Gender.Male
  }
}
