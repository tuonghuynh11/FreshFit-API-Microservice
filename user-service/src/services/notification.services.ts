import * as admin from 'firebase-admin'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import path from 'path'
import Logger from '~/utils/logger'
const credentialPath = path.join(__dirname, '..\\credentials\\credential.json')

admin.initializeApp({
  credential: admin.credential.cert(credentialPath)
})
class NotificationService {
  async sendPushNotification(userId: string, alert: { message: string; advice: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(userId)
    })
    if (user && user.fcmToken) {
      const payload = {
        notification: {
          title: 'Health Warning',
          body: `${alert.message} ${alert.advice}`
        },
        token: user.fcmToken
      }
      await admin.messaging().send(payload)
      Logger.info(`Push notification sent to user ${userId}: ${alert.message}`)
    }
  }
}

const notificationService = new NotificationService()
export default notificationService
