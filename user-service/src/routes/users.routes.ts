import { Router } from 'express'
import {
  addHealthTrackingController,
  addHealthTrackingDetailController,
  addHealthTrackingDetailForMealController,
  addWaterActivityController,
  banUserController,
  changePasswordController,
  checkUserExistedController,
  createCalorieAndTimeToGoalRecommendController,
  createDailyHealthSummaryController,
  createExpertUserController,
  createZegoTokenController,
  deleteDishesInHealthTrackingDetailForMealController,
  deleteHealthTrackingDetailController,
  forgotPasswordController,
  generateHealthPlanController,
  getAllUserController,
  getDailyHealthSummaryController,
  getHealthTrackingController,
  getHealthTrackingMoreDetailController,
  getMeController,
  loginController,
  loginGoogleController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordTokenController,
  sendNotificationController,
  startGoalController,
  storeFcmTokenController,
  unBanUserController,
  updateGoalStatusController,
  updateHealthTrackingController,
  updateHealthTrackingDetailController,
  updateMeController,
  updateUserNotifyController,
  updateUserProfileInternalController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  adminRoleValidator,
  changePasswordValidator,
  createDailyHealthSummaryValidator,
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
 * Description: Get Health Tracking By Id
 * Path: /health-tracking/:id
 * Method: GET
 * Body: {
 * }
 * **/
usersRouter.get(
  '/health-tracking/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getHealthTrackingMoreDetailController)
)

/**
 * Description: Update Health Activity
 * Path: /health-tracking/:id
 * Method: Patch
 * Body: {
 *UpdateHealthTrackingBody
 * }
 * **/
usersRouter.patch(
  '/health-tracking/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(updateHealthTrackingController)
)

/**
 * Description: Add Health Tracking Detail (Use for workout, dish, exercise)
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
 * Description: Add Health Tracking Detail (For meal)
 * Path: /health-tracking-details/meals
 * Method: Post
 * Body: {
 *   mealType: MealType,
 *   dishIds: string[],
 * }
 * **/
usersRouter.post(
  '/health-tracking-details/meals',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(addHealthTrackingDetailForMealController)
)
/**
 * Description: Delete dish in Health Tracking Detail (For meal)
 * Path: /health-tracking/:healthTrackingId/health-tracking-details/:id/dishes
 * Method: Delete
 * Body: {
 *   dishIds: string[],
 * }
 * **/
usersRouter.delete(
  '/health-tracking/:healthTrackingId/health-tracking-details/:id/dishes',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteDishesInHealthTrackingDetailForMealController)
)

/**
 * Description: Update Health Tracking Detail
 * Path: /health-tracking/:healthTrackingId/health-tracking-details/:id
 * Method: Patch
 * Body: {
 * status: GeneralStatus
 *  actual_finish_time: number // thời gian thực tế hoàn thành bài tập
 * }
 * **/
usersRouter.patch(
  '/health-tracking/:healthTrackingId/health-tracking-details/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(updateHealthTrackingDetailController)
)
/**
 * Description: Delete Health Tracking Detail
 * Path: /health-tracking/:healthTrackingId/health-tracking-details/:id
 * Method: Delete
 * Body: {

 * }
 * **/
usersRouter.delete(
  '/health-tracking/:healthTrackingId/health-tracking-details/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteHealthTrackingDetailController)
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

/**
 * Description: Create Expert User
 * Path: /expert/create
 * Method: POST
 * Body: {
    "username":"", 
    "email":"",
    "phoneNumber":"",
    "password":"", // default: 12345678exper@Ex // skip
    "fullName":"",
    "dateOfBirth":"2025-03-10T18:27:36.437Z",
    "gender":"", ["male, female"]
    "height":"", // skip
    "weight":"", // skip
    "avatar":"",
    "specialization": "",
    "experienceYears": 4,
    "bio": "",
    "certifications":[
      {
        "name":"", // Name of the certification
        "issuingOrganization":"", // Organization that issued the certification
        "issueDate":"2025-03-10T18:27:36.437Z", // Date when the certification was issued
        "expirationDate":"" // Can be null
        "credentialUrl":"" //  Can be null
      }
    ],
    "languages":[
        "Vietnamese",
        "English",
        "Korean"
    ],
    "consultationFee":10000000,
    "mainSkills":[
    ], // skill ids
    "experiences":[
      {
        "company":"",
        "position": "",
        "description": "",
        "startDate":"2025-03-10T18:27:36.437Z",
        "endDate":"2025-03-10T18:27:36.437Z" // NULL means still working
      }
    ],
    "educations":[
      {
        "institution":"",
        "degree":"", ["ASSOCIATE", "BACHELOR","MASTER","DOCTORATE"]
        "major":"",
        "startYear":"2021"
        "endYear:"2025" // NULL means still studying
      }
    ]
  }
 * **/
usersRouter.post(
  '/expert/create',
  accessTokenValidator,
  verifiedUSerValidator,
  verifiedAdminValidator,
  wrapRequestHandler(createExpertUserController)
)

/**
 * Description: Create Summary Daily Health Information
 * Path: /daily-health-summary
 * Method: Post
 * Body: {
 *  heartRate: number,
 *  bloodPressure: { systolic: number, diastolic: number },
 *  sleep: { duration: number, quality: SleepQuality },
 *  caloriesBurned: number,
 *  caloriesConsumed: number,
 *  waterIntake: number,
 *  date: Date
 * }
 * **/

usersRouter.post(
  '/daily-health-summary',
  accessTokenValidator,
  verifiedUSerValidator,
  createDailyHealthSummaryValidator,
  wrapRequestHandler(createDailyHealthSummaryController)
)
/**
 * Description: Get Summary Daily Health Information
 * Path: /daily-health-summary
 * Method: Get
 * Body: {}
 * Query:
 * {
 *  getBy: string; (day, week, month, year),
 *  date: string; (2021-09-01)
 * }
 * **/

usersRouter.get(
  '/daily-health-summary',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getDailyHealthSummaryController)
)

/**
 * Description: Store FCM-Token (For Push Notification)
 * Path: /fcm-token
 * Method: Post
 * Body: {
 *  token: string,
 * }
 * **/

usersRouter.post('/fcm-token', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(storeFcmTokenController))

/**
 * Description: Generate Health Plan
 * Path: /generate-health-plan
 * Method: Post
 * Body: {
 *  startDate:string
 *  target: HealthTarget,
 *  desiredWeight: number,
 * }
 * **/

usersRouter.post(
  '/generate-health-plan',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(generateHealthPlanController)
)

/**
 * Description: Create Zego Token (For Video Call)
 * Path: /zego-token
 * Method: Post
 * Body: {
 * }
 * **/

usersRouter.post(
  '/zego-token',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(createZegoTokenController)
)

// Send notification
// * Path: /send-notification
// * Method: Post
// * Body: {
//    title:string,
//    body:string,
//    channelId: string,
//    data: data as object,
//    imageUrl:string
// * }
// * **/
usersRouter.post('/send-notification', wrapRequestHandler(sendNotificationController))

// =================================== External API ===================================
/**
 * Description: Get User By Id (check existing user)
 * Path: /exist/:user_id
 * Method: GET
 * **/
usersRouter.get('/exist/:user_id', wrapRequestHandler(checkUserExistedController))

/**
 * Description: Update User Profile Internal
 * Path: /update-info-internal/:id
 * Method: PATCH
 * Body:{
 *  fullName: string,
 * }
 * **/
usersRouter.patch('/update-info-internal/:id', wrapRequestHandler(updateUserProfileInternalController))
export default usersRouter
