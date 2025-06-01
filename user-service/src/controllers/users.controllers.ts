import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HealthActivityQueryType, UserRole, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import {
  HEALTH_MESSAGES,
  HEALTH_TRACKING_DETAIL_MESSAGES,
  HEALTH_TRACKING_MESSAGES,
  RECOMMEND_MESSAGES,
  USERS_MESSAGES
} from '~/constants/messages'
import { GenerateHealthPlanBody } from '~/models/requests/HealthPlan.requests'
import { HealthTrackingBody, UpdateHealthTrackingBody } from '~/models/requests/HealthTracking.requests'
import {
  DeleteDishesInHealthTrackingDetailForMealBody,
  HealthTrackingDetailBody,
  HealthTrackingDetailForMealBody,
  UpdateHealthTrackingDetailBody
} from '~/models/requests/HealthTrackingDetail.requests'
import {
  BanUserReqParams,
  ChangePasswordReqBody,
  CreateDailyHealthSummaryBody,
  CreateExpertUserBody,
  ForgotPasswordReqBody,
  LoginGoogleReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  UpdateUserNotifySettingsReqBody,
  VerifyForgotPasswordReqBody,
  VerifyReqReqBody
} from '~/models/requests/User.requests'
import { WaterBody } from '~/models/requests/Water.requests'
import User from '~/models/schemas/User.schema'
import alertService from '~/services/alert.services'
import appointmentService from '~/services/appointment.services'
import databaseService from '~/services/database.services'
import healthTrackingService from '~/services/healthTracking.services'
import healthTrackingDetailService from '~/services/healthTrackingDetail.services'
import pushNotificationService from '~/services/push-notification.services'
import recommendService from '~/services/recommend.services'
import userService from '~/services/users.services'
import waterService from '~/services/water.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const expertInfo = await appointmentService.checkExpertExist(user_id.toString())
  const result = await userService.login({
    user_id: user_id.toString(),
    verify: user.verify as UserVerifyStatus,
    user_role: user.role as UserRole,
    expertId: expertInfo ? expertInfo.id : null
  })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result: result
  })
}
export const loginGoogleController = async (req: Request<ParamsDictionary, any, LoginGoogleReqBody>, res: Response) => {
  const result = await userService.loginByGoogle({
    email: req.body.email,
    name: req.body.name,
    picture: req.body.picture
  })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result: result
  })
}
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json({
    message: result.message
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.json({
    message: 'Success',
    result
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { decoded_refresh_token } = req

  const { exp, verify } = decoded_refresh_token as TokenPayload
  const expTime: number = (exp as number) - Math.floor(Date.now() / 1000)

  const result = await userService.refreshToken({
    old_refresh_token: refresh_token,
    user_id: decoded_refresh_token?.user_id as string,
    role: decoded_refresh_token?.role as UserRole,
    verify: verify,
    exp: expTime
  })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFUL,
    result: result
  })
}
export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyReqReqBody>, res: Response) => {
  const { _id } = req.user as User
  const user = await databaseService.users.findOne({ _id })

  //Nếu không tìm thây user
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  //Đã verify rồi thì không báo lỗi
  //Trả về status OK với message là đã verify trước đó rồi
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await userService.verifyEmail(_id!.toString(), user.role as UserRole)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result: result
  })
}
export const resendVerifyEmailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  // const { user_id } = req.decoded_authorization as TokenPayload
  const { email } = req.body
  const user = await databaseService.users.findOne({ email })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await userService.resendVerifyEmail(user._id.toString(), user.email?.toString() as string)
  return res.json(result)
}
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    email: req.body.email
  })
  return res.json(result)
}
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user as User
  const forgot_password_token = await userService.verifyForgotPasswordToken(_id!.toString())
  return res.json({
    message: USERS_MESSAGES.VERIFY_OTP_CODE_SUCCESS,
    forgot_password_token
  })
}
export const resetPasswordTokenController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  console.log('user_id', user_id)
  console.log('password', password)
  const result = await userService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_MY_PROFILE_SUCCESS,
    result: user
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await userService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_MY_PROFILE_SUCCESS,
    result: user
  })
}
export const updateUserNotifyController = async (
  req: Request<ParamsDictionary, any, UpdateUserNotifySettingsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await userService.updateUserNotifySettings(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_USER_NOTIFY_SETTINGS_SUCCESS,
    result: user
  })
}
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { new_password } = req.body
  const result = await userService.changePassword(user_id, new_password)
  return res.json(result)
}
export const banUserController = async (req: Request<BanUserReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.params
  const user = await userService.banUser(user_id)
  return res.json({
    message: USERS_MESSAGES.BAN_USER_SUCCESS,
    result: user
  })
}

export const unBanUserController = async (req: Request<BanUserReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.params
  const user = await userService.unBanUser(user_id)
  return res.json({
    message: USERS_MESSAGES.UNBAN_USER_SUCCESS,
    result: user
  })
}

export const getAllUserController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const isBan = Number(req.query?.isBan)
  const { users, total } = await userService.getAllUsers({ page, limit, isBan })
  return res.json({
    message: USERS_MESSAGES.GET_ALL_USERS_SUCCESS,
    result: {
      users: users,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const getHealthTrackingController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const type = req.query.type as HealthActivityQueryType
  const date = req.query.date!.toString()
  const { water, consumed, burned } = await userService.getHealthActivity({ type, date, user_id })
  return res.json({
    message: USERS_MESSAGES.GET_USER_HEALTH_TRACKING_SUCCESS,
    result: {
      water,
      consumed,
      burned
    }
  })
}
export const addWaterActivityController = async (req: Request<ParamsDictionary, any, WaterBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  await waterService.add({ user_id, water: req.body })
  return res.json({
    message: USERS_MESSAGES.UPDATE_USER_WATER_ACTIVITY_SUCCESS
  })
}
export const addHealthTrackingController = async (
  req: Request<ParamsDictionary, any, HealthTrackingBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  await healthTrackingService.add({ user_id, healthTracking: req.body })
  return res.json({
    message: USERS_MESSAGES.ADD_HEALTH_ACTIVITY_SUCCESS
  })
}
export const getHealthTrackingMoreDetailController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await healthTrackingService.getById({ user_id, id })
  return res.json({
    message: HEALTH_TRACKING_MESSAGES.GET_HEALTH_TRACKING_SUCCESS,
    result
  })
}
export const updateHealthTrackingController = async (
  req: Request<ParamsDictionary, any, UpdateHealthTrackingBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await healthTrackingService.update({ user_id, id, updateHealthTracking: req.body })
  return res.json({
    message: USERS_MESSAGES.UPDATE_HEALTH_ACTIVITY_SUCCESS,
    result
  })
}
export const addHealthTrackingDetailController = async (
  req: Request<ParamsDictionary, any, HealthTrackingDetailBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { healthTrackingDetail, health_tracking_detail_id, health_tracking_id } = await healthTrackingDetailService.add(
    { user_id, healthTrackingDetail: req.body }
  )
  return res.json({
    message: HEALTH_TRACKING_DETAIL_MESSAGES.ADD_HEALTH_TRACKING_DETAIL_SUCCESS,
    result: {
      healthTrackingDetail,
      health_tracking_detail_id,
      health_tracking_id
    }
  })
}
export const addHealthTrackingDetailForMealController = async (
  req: Request<ParamsDictionary, any, HealthTrackingDetailForMealBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const response = await healthTrackingDetailService.addHealthTrackingDetailForMeal({
    user_id,
    healthTrackingDetail: req.body
  })
  return res.json({
    message: HEALTH_TRACKING_DETAIL_MESSAGES.ADD_HEALTH_TRACKING_DETAIL_FOR_MEAL_SUCCESS,
    result: {
      healthTrackingDetail: response!.healthTrackingDetail,
      health_tracking_detail_id: response!.health_tracking_detail_id,
      health_tracking_id: response!.health_tracking_id
    }
  })
}
export const deleteDishesInHealthTrackingDetailForMealController = async (
  req: Request<ParamsDictionary, any, DeleteDishesInHealthTrackingDetailForMealBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { id, healthTrackingId } = req.params
  await healthTrackingDetailService.deleteDishesInHealthTrackingDetailForMeal({
    user_id,
    healthTrackingId,
    id,
    dishIds: req.body.dishIds
  })
  return res.json({
    message: HEALTH_TRACKING_DETAIL_MESSAGES.DELETE_DISHES_IN_HEALTH_TRACKING_DETAIL_FOR_MEAL_SUCCESS
  })
}
export const updateHealthTrackingDetailController = async (
  req: Request<ParamsDictionary, any, UpdateHealthTrackingDetailBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id, healthTrackingId } = req.params
  await healthTrackingDetailService.update({ user_id, id, healthTrackingId, updateHealthTrackingDetail: req.body })
  return res.json({
    message: HEALTH_TRACKING_DETAIL_MESSAGES.UPDATE_HEALTH_TRACKING_DETAIL_SUCCESS
  })
}
export const deleteHealthTrackingDetailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id, healthTrackingId } = req.params

  await healthTrackingDetailService.delete({ user_id, id, healthTrackingId })
  return res.json({
    message: HEALTH_TRACKING_DETAIL_MESSAGES.DELETE_HEALTH_TRACKING_DETAIL_SUCCESS
  })
}
export const createCalorieAndTimeToGoalRecommendController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const response = await recommendService.createCalorieAndTimeToGoalRecommendForUser({ user_id })
  return res.json({
    message: RECOMMEND_MESSAGES.CREATE_CALORIE_AND_TIME_TO_GOAL_RECOMMEND_FOR_USER_SUCCESS,
    result: response
  })
}
export const startGoalController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const response = await userService.startGoal({ user_id })
  return res.json({
    message: USERS_MESSAGES.START_GOAL_SUCCESS
  })
}
export const updateGoalStatusController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { status } = req.body
  const response = await userService.updateGoalStatus({ user_id, status })
  return res.json({
    message: USERS_MESSAGES.UPDATE_GOAL_STATUS_SUCCESS,
    result: response
  })
}

export const checkUserExistedController = async (req: Request<BanUserReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.params
  const user = await userService.checkUserExited(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_USER_SUCCESS,
    result: user
  })
}

export const createExpertUserController = async (
  req: Request<ParamsDictionary, any, CreateExpertUserBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.createExpertUser(req.body)
  return res.json({
    message: USERS_MESSAGES.CREATE_EXPERT_USER_SUCCESS,
    result
  })
}
export const createDailyHealthSummaryController = async (
  req: Request<ParamsDictionary, any, CreateDailyHealthSummaryBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.createDailyHealthSummary({ user_id, payload: req.body })
  const alerts = await alertService.checkHealthRisks(user_id)
  console.log('Alerts', alerts)
  if (alerts.length > 0) {
    for (const alert of alerts) {
      await pushNotificationService.sendHealthPushNotification(user_id, alert)
    }
  }
  return res.json({
    message: HEALTH_MESSAGES.CREATE_DAILY_HEALTH_SUMMARY_SUCCESS,
    result
  })
}

export const getDailyHealthSummaryController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const date = req.query.date!.toString()
  const result = await userService.getDailyHealthSummary({ date, user_id })
  return res.json({
    message: HEALTH_MESSAGES.GET_DAILY_HEALTH_SUMMARY_SUCCESS,
    result
  })
}
export const storeFcmTokenController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await userService.storeFcmToken({ user_id, token: req.body.token })
  return res.json({
    message: USERS_MESSAGES.STORE_FCM_TOKEN_SUCCESS,
    result
  })
}
export const createZegoTokenController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await userService.createZegoToken(user_id)
  return res.json({
    message: USERS_MESSAGES.CREATE_ZEGO_TOKEN_SUCCESS,
    token: result
  })
}
export const generateHealthPlanController = async (
  req: Request<ParamsDictionary, any, GenerateHealthPlanBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await userService.generateHealthPlan({ user_id, payload: req.body })
  return res.json({
    message: HEALTH_MESSAGES.GENERATE_HEALTH_PLAN_SUCCESS,
    result
  })
}

export const sendNotificationController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { userId, type, title, body, channelId, data, imageUrl } = req.body
  await pushNotificationService.sendPushNotificationCustom({
    userId,
    type,
    alert: {
      title: title as string,
      body: body as string,
      channelId: channelId as string,
      data: data as object,
      imageUrl: imageUrl as string
    }
  })
  return res.json({
    message: 'Test send notification success'
  })
}

export const updateUserProfileInternalController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const id = req.params.id as string
  const result = await userService.updateUserProfileInternal({ user_id: id, payload: req.body })
  return res.json({
    message: USERS_MESSAGES.UPDATE_USER_PROFILE_INTERNAL_SUCCESS,
    result
  })
}
