import { config } from 'dotenv'
const env = process.env.NODE_ENV?.trim()
if (!env) {
  console.log(`Bạn chưa cung cấp biến môi trường NODE_ENV (ví dụ: development, production)`)
  console.log(`Phát hiện NODE_ENV = ${env}`)
  process.exit(1)
}
console.log(`Phát hiện NODE_ENV = ${env}, vì thế app sẽ dùng file môi trường là ${env}`)

export const isProduction = env === 'production'
config({
  path: env ? `.env.${env}` : '.env'
})
export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  host: process.env.HOST as string,
  appointmentServiceHost: process.env.APPOINTMENT_SERVICE_HOST as string,
  recommendationServiceHost: process.env.RECOMMENDATION_SERVICE_HOST as string,
  dbName: process.env.DB_NAME as string,
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbUsersCollection: process.env.DB_USERS_COLLECTION as string,
  dbHealthTrackingsCollection: process.env.DB_HEALTH_TRACKING_COLLECTION as string,
  dbHealthTrackingDetailsCollection: process.env.DB_HEALTH_TRACKING_DETAIL_COLLECTION as string,
  dbWatersCollection: process.env.DB_WATER_COLLECTION as string,
  dbMealsCollection: process.env.DB_MEAL_COLLECTION as string,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  dbChallengesCollection: process.env.DB_CHALLENGES_COLLECTION as string,
  dbExercisesCollection: process.env.DB_EXERCISES_COLLECTION as string,
  dbSetExercisesCollection: process.env.DB_SET_EXERCISES_COLLECTION as string,
  dbSetsCollection: process.env.DB_SETS_COLLECTION as string,
  dbWorkoutPlanDetailsCollection: process.env.DB_WORKOUT_PLAN_DETAILS_COLLECTION as string,
  dbWorkoutPlansCollection: process.env.DB_WORKOUT_PLAN_COLLECTION as string,
  dbDishesCollection: process.env.DB_DISHES_COLLECTION as string,
  dbIngredientsCollection: process.env.DB_INGREDIENTS_COLLECTION as string,
  dbReportsCollection: process.env.DB_REPORTS_COLLECTION as string,
  dbChatRoomsCollection: process.env.DB_CHAT_ROOMS_COLLECTION as string,
  dbChatDetailsCollection: process.env.DB_CHAT_DETAILS_COLLECTION as string,
  dbTransactionsCollection: process.env.DB_TRANSACTIONS_COLLECTION as string,
  dbPostsCollection: process.env.DB_POSTS_COLLECTION as string,
  dbPostReactionsCollection: process.env.DB_POST_REACTIONS_COLLECTION as string,
  dbPostCommentsCollection: process.env.DB_POST_COMMENTS_COLLECTION as string,
  dbPostBookmarksCollection: process.env.DB_POST_BOOKMARKS_COLLECTION as string,
  dbHealthDataCollection: process.env.DB_HEALTH_DATA_COLLECTION as string,
  dbNotificationsCollection: process.env.DB_NOTIFICATIONS_COLLECTION as string,
  dbHealthPlansCollection: process.env.DB_HEALTH_PLANS_COLLECTION as string,
  dbHealthPlanDetailsCollection: process.env.DB_HEALTH_PLAN_DETAILS_COLLECTION as string,
  dbUserChallengeParticipationCollection: process.env.DB_USER_CHALLENGE_PARTICIPATION_COLLECTION as string,
  dbUserChallengeParticipationProgressCollection: process.env
    .DB_USER_CHALLENGE_PARTICIPATION_PROGRESS_COLLECTION as string,

  passwordSecret: process.env.PASSWORD_SECRET as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  cloud_name: process.env.CLOUD_NAME as string,
  api_key: process.env.API_KEY as string,
  api_secret: process.env.API_SECRET as string,

  admin_mail: process.env.ADMIN_MAIL as string,
  // awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  // awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  // awsRegion: process.env.AWS_REGION as string,
  // sesFromAddress: process.env.SES_FROM_ADDRESS as string,
  // s3BucketName: process.env.S3_BUCKET_NAME as string

  //ZALO PAY
  zalo_app_id: process.env.ZALO_APP_ID || '',
  zalo_key_1: process.env.ZALO_KEY_1 || '',
  zalo_key_2: process.env.ZALO_KEY_2 || '',
  zalo_endpoint: process.env.ZALO_END_POINT || '',
  zalo_redirect_url: process.env.ZALO_REDIRECT_URL || '',
  zalo_app_user: process.env.ZALO_APP_USER || '',
  // DEFAULT PASSWORD
  defaultExpertPassword: process.env.DEFAULT_EXPERT_PASSWORD || '12345678expert@Ex',

  // ZEGO SERVICE
  zegoAppId: process.env.ZEGO_APP_ID || 0,
  zegoServerSecret: process.env.ZEGO_SERVER_SECRET || '',
  zegoEffectiveTimeInSeconds: process.env.ZEGO_EFFECTIVE_TIME_IN_SECONDS || 3600 * 24 * 365 // 1 year
}
