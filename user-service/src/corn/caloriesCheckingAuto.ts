import { HealthTrackingType, NotificationType, UserRole, UserVerifyStatus } from '~/constants/enums'
import databaseService from '~/services/database.services'
import pushNotificationService from '~/services/push-notification.services'
import { getNowDateWithoutTime } from '~/utils/commons'

interface IAlert {
  userId: string
  title: string
  body: string
  type: NotificationType
  data: {
    type: NotificationType
    screen?: string
  }
}

export const caloriesCheckingAuto = async () => {
  const today = getNowDateWithoutTime()

  const users = await databaseService.users
    .find({
      role: UserRole.User,
      verify: UserVerifyStatus.Verified
    })
    .toArray()
  const healthTrackings = await databaseService.healthTrackings
    .find({
      user_id: { $in: users.map((user) => user._id) },
      date: today
    })
    .toArray()
  const alerts: IAlert[] = []
  healthTrackings.forEach((tracking) => {
    if (tracking.value < tracking.target) {
      if (tracking.type === HealthTrackingType.Calories_Consumed) {
        alerts.push({
          userId: tracking.user_id!.toString(),
          title: "Keep Going! You Haven't Reached Your Eating Goal Yet",
          body: `You've consumed ${tracking.value} calories so far. Your goal is ${tracking.target} calories today. Let's have a little more to reach it!`,
          type: NotificationType.Eating,
          data: {
            type: NotificationType.Eating,
            screen: '(main)/meal'
          }
        })
      }
      if (tracking.type === HealthTrackingType.Calories_Burned) {
        alerts.push({
          userId: tracking.user_id!.toString(),
          title: 'Almost There! Keep Moving to Hit Your Burn Goal',
          body: `You've burned ${tracking.value} calories today. Your goal is ${tracking.target} calories. A little more effort and you'll get there!`,
          type: NotificationType.Workout,
          data: {
            type: NotificationType.Workout,
            screen: '(main)/workout'
          }
        })
      }
    }
  })
  await Promise.all(
    alerts.map(async (alert) => {
      return pushNotificationService.sendPushNotificationCustom({
        userId: alert.userId,
        type: alert.type,
        alert: {
          title: alert.title,
          body: alert.body,
          channelId: 'default',
          data: alert.data
        }
      })
    })
  )
}
