import { Router } from 'express'
import {
  addHealthTrackingController,
  addHealthTrackingDetailController,
  addWaterActivityController,
  banUserController,
  changePasswordController,
  checkUserExistedController,
  createCalorieAndTimeToGoalRecommendController,
  forgotPasswordController,
  getAllUserController,
  getHealthTrackingController,
  getMeController,
  loginController,
  loginGoogleController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordTokenController,
  startGoalController,
  unBanUserController,
  updateGoalStatusController,
  updateMeController,
  updateUserNotifyController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  adminRoleValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordTokenValidator,
  updateMeValidator,
  updateUserNotifyValidator,
  userBannedValidator,
  userIsOnlineValidator,
  verifiedAdminValidator,
  verifiedUSerValidator,
  verifyEmailValidator,
  verifyOTPCodeValidator
} from '~/middlewares/users.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { UpdateMeReqBody, UpdateUserNotifySettingsReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /users
const usersRouter = Router()

/**
 * Description: Get ALL User
 * Path: /
 * Method: GET
 * **/
usersRouter.get(
  '/',
  accessTokenValidator,
  adminRoleValidator,
  paginationNavigator,
  wrapRequestHandler(getAllUserController)
)

/**
 * Description: Login to an account by username
 * Path: /login
 * Method: POST
 * Body: {email_or_username:string, password:string}
 * **/
usersRouter.post(
  '/login',
  loginValidator,
  userBannedValidator,
  userIsOnlineValidator,
  wrapRequestHandler(loginController)
)

/**
 * Description: Login to an account by google
 * Path: /login-google
 * Method: POST
 * Body: {email:string, name:string,picture:string}
 * **/
usersRouter.post('/login-google', wrapRequestHandler(loginGoogleController))

/**
 * Description: Register an account by username or email
 * Path: /register
 * Method: POST
 * Body: {username:string, email:string, password:string }
 * **/

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Refresh Token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token:string}
 * **/
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Logout a user
 * Path: /logout
 * Method: POST
 * Header:{Authorization:Bearer <access_token>}
 * Body: { refresh_token:string}
 * **/
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Verify Email
 * Path: /verify-email
 * Method: POST
 * Body: { email:string, otp_code:string}
 * **/
usersRouter.post('/verify-email', verifyEmailValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: Resend Verify Email
 * Path: /resend-verify-email
 * Method: POST
 * Header:{Authorization:Bearer <access_token>}
 * Body: {email:string}
 * **/
usersRouter.post('/resend-verify-email', wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email:string}
 * **/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify code in email to reset password
 * Path: /verify-otp-code
 * Method: POST
 * Body: {otp_code:string}
 * **/
usersRouter.post('/verify-otp-code', verifyOTPCodeValidator, wrapRequestHandler(verifyForgotPasswordTokenController))

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: {forgot-password-token:string, password:string,confirm-password:string}
 * **/
usersRouter.post('/reset-password', resetPasswordTokenValidator, wrapRequestHandler(resetPasswordTokenController))

/**
 * Description: Get My Profile
 * Path: /me
 * Method: GET
 * Header:{Authorization:Bearer <access_token>}
 * **/
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Update My Profile
 * Path: /me
 * Method: PATCH
 * Header:{Authorization:Bearer <access_token>}
 * Body:UserSchema
 * **/
usersRouter.patch(
  '/me',
  accessTokenValidator,
  // verifiedUSerValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'username',
    'fullName',
    'date_of_birth',
    'gender',
    'avatar',
    'height',
    'weight',
    'goal_weight',
    'level',
    'activityLevel'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Change Password
 * Path: /change-password
 * Method: PUT
 * Header:{Authorization:Bearer <access_token>}
 * Body:{old_password:string,new_password:string, confirm_password:string}
 * **/
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUSerValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

/**
 * Description: Ban User
 * Path: /ban/:user_id
 * Method: POST
 * **/
usersRouter.post(
  '/ban/:user_id',
  accessTokenValidator,
  verifiedUSerValidator,
  verifiedAdminValidator,
  wrapRequestHandler(banUserController)
)

/**
 * Description: UnBan User
 * Path: /unban/:user_id
 * Method: POST
 * **/
usersRouter.post(
  '/unban/:user_id',
  accessTokenValidator,
  verifiedUSerValidator,
  verifiedAdminValidator,
  wrapRequestHandler(unBanUserController)
)

/**
 * Description: View Health Activity
 * Path: /health-tracking
 * Method: Get
 * Query:
 * {
 *  type:number; (all, water, consumed, burned),
 *  getBy: string; (day, week, month, year),
 *  date: string; (2021-09-01)
 * }
 * **/
usersRouter.get(
  '/health-tracking',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getHealthTrackingController)
)
/**
 * Description: Add Health Activity
 * Path: /health-tracking
 * Method: Post
 * Body: {
 *HealthTrackingBody
 * }
 * **/
usersRouter.post(
  '/health-tracking',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addHealthTrackingController)
)

/**
 * Description: Add Health Tracking Detail
 * Path: /health-tracking-details
 * Method: Post
 * Body: {
 *HealthTrackingDetailBody
 * }
 * **/
usersRouter.post(
  '/health-tracking-details',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addHealthTrackingDetailController)
)

/**
 * Description: Add Water Activity
 * Path: /waters
 * Method: Post
 * Body: {
 *  date: Date
 *  goal: number
 *  step: number
 * }
 * **/
usersRouter.post('/waters', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(addWaterActivityController))

/**
 * Description: Upsert user notifications
 * Path: /me/notify-settings
 * Method: PATCH
 * Header:{Authorization:Bearer <access_token>}
 * Body: UserSchema
 * **/
usersRouter.patch(
  '/me/notify-settings',
  accessTokenValidator,
  verifiedUSerValidator,
  updateUserNotifyValidator,
  filterMiddleware<UpdateUserNotifySettingsReqBody>([
    'isAdmin',
    'isChallenge',
    'isEating',
    'isWorkout',
    'isWater',
    'isHealth'
  ]),
  wrapRequestHandler(updateUserNotifyController)
)

/**
 * Description: Create recommendation
 * Path: /recommend
 * Method: Post
 * Body: {
 *
 * }
 * **/
usersRouter.post(
  '/recommend',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(createCalorieAndTimeToGoalRecommendController)
)
/**
 * Description: Start goal
 * Path: /goal/start
 * Method: Post
 * Body: {
 *
 * }
 * **/
usersRouter.post('/goal/start', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(startGoalController))
/**
 * Description: Update goal status
 * Path: /goal
 * Method: Put
 * Body: {
 *  status :GoalDetailStatus
 * }
 * **/
usersRouter.put('/goal', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(updateGoalStatusController))

// =================================== External API ===================================
/**
 * Description: Get User By Id (check existing user)
 * Path: /exist/:user_id
 * Method: GET
 * **/
usersRouter.get('/exist/:user_id', wrapRequestHandler(checkUserExistedController))
export default usersRouter
