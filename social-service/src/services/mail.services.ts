import dotenv from 'dotenv'
import { envConfig } from '~/constants/config'
import axios from 'axios'
import Logger from '~/utils/logger'

dotenv.config()

class MailService {
  // private nodeMailer!: Transporter
  // constructor() {}
  // async connect() {
  //   try {
  //     // Send a ping to confirm a successful connection
  //     this.nodeMailer = createTransport({
  //       host: envConfig.smtpHost,
  //       port: envConfig.smtpPort,
  //       secure: envConfig.smtpSecure,
  //       auth: {
  //         user: envConfig.smtpUser,
  //         pass: envConfig.smtpPassword
  //       }
  //     })
  //     console.log('Pinged your nodemailer. You successfully connected to NodeMailer!')
  //   } catch (error) {
  //     console.log('NodeMailer Error:', error)
  //   }
  // }
  // public getNodeMailer(): Transporter {
  //   return this.nodeMailer
  // }
  // public async sendMail({
  //   emails,
  //   subject,
  //   template,
  //   data
  // }: {
  //   emails: string
  //   subject: string
  //   template: string
  //   data: any
  // }) {
  //   const templateHtml = fs.readFileSync(path.join(MAIL_TEMPLATES_DIR, `${template}.mustache`), 'utf-8')
  //   const html = mustache.render(templateHtml, data)

  //   const info = await this.nodeMailer.sendMail({
  //     from: `"FreshFit" <${envConfig.smtpUser}>`,
  //     to: emails,
  //     subject: subject,
  //     html
  //   })

  //   Logger.info(`Message sent: ${info.messageId}`)
  //   Logger.info('Subject: ' + subject)
  //   Logger.info('Email: ' + emails)
  // }

  // public async sendExpertAccountCreatedMail({
  //   email,
  //   password,
  //   name
  // }: {
  //   name: string
  //   email: string
  //   password: string
  // }) {
  //   const data = {
  //     name,
  //     email,
  //     password
  //   }
  //   await this.sendMail({
  //     emails: email,
  //     template: 'ExpertAccountCreated',
  //     subject: 'Welcome to FreshFit – Your Expert Account Has Been Created',
  //     data
  //   })
  // }

  // public async sendVerifyEmail({ email, otp_code }: { email: string; otp_code: string }) {
  //   const data = {
  //     otp_code
  //   }
  //   await this.sendMail({
  //     emails: email,
  //     template: 'VerifyEmail',
  //     subject: 'Verify Your Email Address',
  //     data
  //   })
  // }
  // public async sendForgotPasswordEmail({ email, otp_code }: { email: string; otp_code: string }) {
  //   const data = {
  //     otp_code
  //   }
  //   await this.sendMail({
  //     emails: email,
  //     template: 'ForgotPassword',
  //     subject: 'Reset Your Password',
  //     data
  //   })
  // }
  public async sendExpertAccountCreatedMail({
    email,
    password,
    name
  }: {
    name: string
    email: string
    password: string
  }) {
    try {
      await axios.post(`${envConfig.mailServiceHost}/mails/send-expert-account-created-email`, {
        name,
        email,
        password
      })
      Logger.info('Mail: ' + 'ExpertAccountCreated')
      Logger.info('Email: ' + email)
    } catch (error) {
      Logger.error('Error sending Expert Account Created Mail:', error)
    }
  }

  public async sendVerifyEmail({ email, otp_code }: { email: string; otp_code: string }) {
    try {
      await axios.post(`${envConfig.mailServiceHost}/mails/send-verify-email`, {
        email,
        otp_code
      })
      Logger.info('Mail: ' + 'VerifyEmail')
      Logger.info('Email: ' + email)
    } catch (error) {
      Logger.error('Error sending Verify Email:', error)
    }
  }
  public async sendForgotPasswordEmail({ email, otp_code }: { email: string; otp_code: string }) {
    try {
      await axios.post(`${envConfig.mailServiceHost}/mails/send-forgot-password-email`, {
        email,
        otp_code
      })
      Logger.info('Mail: ' + 'ForgotPassword')
      Logger.info('Email: ' + email)
    } catch (error) {
      Logger.error('Error sending Forgot Password Email:', error)
    }
  }
}

const mailService = new MailService()
export default mailService
