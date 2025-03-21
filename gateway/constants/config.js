import { config } from 'dotenv'
config()
export const envConfig = {
  port: (process.env.PORT ) || 3000,
//   host: process.env.HOST ,
  passwordSecret: process.env.PASSWORD_SECRET ,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN ,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN ,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN ,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN ,
}
