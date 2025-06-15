import { Filter, ObjectId } from 'mongodb'
import { NotificationType } from '~/constants/enums'
import Notifications from '~/models/schemas/Notifications.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { CreateNotificationReqBody } from '~/models/requests/Notification.requests'
import pushNotificationService from './push-notification.services'

class NotificationService {
  async search({
    page,
    limit,
    type,
    sort_by = 'created_at',
    order_by = 'DESC',
    user_id
  }: {
    type?: NotificationType
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    user_id: string
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const conditions: Filter<Notifications> = {
      user_id: new ObjectId(user_id)
    }

    if (type) {
      conditions.type = type
    }

    const [notifications, total] = await Promise.all([
      databaseService.notifications
        .find(conditions, {
          skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
          limit: Number(limit),
          sort: {
            isRead: 1,
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.notifications.countDocuments(conditions)
    ])

    return {
      notifications,
      total
    }
  }
  async markRead({ user_id, notification_ids }: { user_id: string; notification_ids: string[] }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.notifications.updateMany(
      {
        _id: { $in: notification_ids.map((id) => new ObjectId(id)) },
        user_id: new ObjectId(user_id)
      },
      {
        $set: {
          isRead: true
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result
  }
  async markAllRead({ user_id }: { user_id: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.notifications.updateMany(
      {
        user_id: new ObjectId(user_id),
        isRead: false
      },
      {
        $set: {
          isRead: true
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result
  }
  async countUnreadNotifications({ user_id }: { user_id: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const totalUnreadNotifications = await databaseService.notifications.countDocuments({
      user_id: new ObjectId(user_id),
      isRead: false
    })
    return totalUnreadNotifications
  }
  async createNotification({ user_id, payload }: { user_id: string; payload: CreateNotificationReqBody }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.notifications.insertOne(
      new Notifications({
        user_id: new ObjectId(user_id),
        title: payload.title,
        message: payload.message,
        type: payload.type,
        action: payload?.action
      })
    )
    if (user?.fcmToken) {
      await pushNotificationService.sendPushNotificationCustom({
        userId: user._id.toString(),
        type: NotificationType.Other,
        alert: {
          title: payload.title as string,
          body: payload.message as string
        },
        isInsertToDB: false
      })
    }
    const response = await databaseService.notifications.findOne({
      _id: result.insertedId
    })
    return response
  }
}

const notificationService = new NotificationService()
export default notificationService
