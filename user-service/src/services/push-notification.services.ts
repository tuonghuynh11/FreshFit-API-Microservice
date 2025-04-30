import * as admin from 'firebase-admin'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import Logger from '~/utils/logger'
import { FIREBASE_CREDENTIAL_DIR } from '~/constants/dir'
import axios from 'axios'
import { NotificationType } from '~/constants/enums'
import Notifications from '~/models/schemas/Notifications.schema'
const credentialPath = FIREBASE_CREDENTIAL_DIR

admin.initializeApp({
  credential: admin.credential.cert(credentialPath)
})
class PushNotificationService {
  async sendHealthPushNotification(userId: string, alert: { message: string; advice: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(userId)
    })

    if (user && user.fcmToken?.startsWith('ExponentPushToken')) {
      const payload = {
        to: user.fcmToken,
        title: 'Health Warning',
        body: `${alert.message} ${alert.advice}`,
        sound: 'default',
        data: {
          userId,
          message: alert.message,
          advice: alert.advice
        },
        image: 'https://matinzd.github.io/react-native-health-connect/img/health_connect_logo.png',
        channelId: 'default'
      }

      try {
        const response = await axios.post('https://exp.host/--/api/v2/push/send', payload, {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
          }
        })
        await databaseService.notifications.insertOne({
          user_id: new ObjectId(userId),
          title: 'Health Warning',
          message: `${alert.message} ${alert.advice}`,
          type: NotificationType.Health
        })
        Logger.info(`Push notification sent to user ${userId}: ${alert.message}`, response.data)
      } catch (error) {
        Logger.error(`Failed to send push notification to user ${userId}`, error)
      }
    } else {
      Logger.warn(`User ${userId} does not have a valid Expo push token.`)
    }
  }

  async sendPushNotificationCustom({
    userId,
    type,
    alert
  }: {
    userId: string
    type: NotificationType
    alert: {
      title: string
      body: string
      channelId?: string
      data?: { screen?: string } & Record<string, any>
      imageUrl?: string
    }
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(userId)
    })

    if (user && user.fcmToken) {
      // Kiểm tra token có phải là ExponentPushToken không
      if (user.fcmToken.startsWith('ExponentPushToken')) {
        // Gửi notification qua Expo Push Notification service
        const payload = {
          to: user.fcmToken,
          sound: 'default',
          title: alert.title,
          body: alert.body,
          data: alert.data,
          channelId: alert.channelId || 'default',
          image: alert.imageUrl || undefined
        }

        try {
          const res = await axios.post('https://exp.host/--/api/v2/push/send', payload, {
            headers: {
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Type': 'application/json'
            }
          })
          await databaseService.notifications.insertOne(
            new Notifications({
              user_id: new ObjectId(userId),
              title: alert.title,
              message: alert.body,
              type,
              action: alert.data?.screen || undefined
            })
          )
          Logger.info(`Expo Push notification sent to user ${userId}: ${alert.title}`)
        } catch (error: any) {
          Logger.error(`Failed to send push notification to ${userId}: ${error.message}`)
        }
      } else {
        // Nếu bạn có hỗ trợ cả FCM token thật thì xử lý ở đây
        Logger.warn(`Invalid or unsupported push token for user ${userId}`)
      }
    }
  }
}

const pushNotificationService = new PushNotificationService()
export default pushNotificationService
