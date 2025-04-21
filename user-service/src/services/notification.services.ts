import * as admin from 'firebase-admin'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import Logger from '~/utils/logger'
import { FIREBASE_CREDENTIAL_DIR } from '~/constants/dir'
const credentialPath = FIREBASE_CREDENTIAL_DIR

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
