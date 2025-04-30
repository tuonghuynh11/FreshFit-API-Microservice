import { Request, Response } from 'express'
import {
  CreateNotificationReqBody,
  MarkReadNotificationReqBody,
  NotificationReqQuery
} from '~/models/requests/Notification.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import notificationService from '~/services/notifications.services'
import { NOTIFICATION_MESSAGES } from '~/constants/messages'

export const getNotificationsController = async (
  req: Request<ParamsDictionary, any, any, NotificationReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { page, limit, type, sort_by, order_by } = req.query
  const { notifications, total } = await notificationService.search({
    type,
    page,
    limit,
    sort_by,
    order_by,
    user_id
  })
  return res.json({
    message: NOTIFICATION_MESSAGES.GET_NOTIFICATION_SUCCESS,
    result: {
      notifications,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const markReadNotificationsController = async (
  req: Request<ParamsDictionary, any, MarkReadNotificationReqBody, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { notification_ids } = req.body
  const result = await notificationService.markRead({
    notification_ids,
    user_id
  })
  return res.json({
    message: NOTIFICATION_MESSAGES.MARK_READ_NOTIFICATION_SUCCESS
  })
}
export const markAllReadNotificationsController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const result = await notificationService.markAllRead({
    user_id
  })
  return res.json({
    message: NOTIFICATION_MESSAGES.MARK_ALL_READ_NOTIFICATION_SUCCESS
  })
}
export const countUnreadNotificationsController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const result = await notificationService.countUnreadNotifications({
    user_id
  })
  return res.json({
    message: NOTIFICATION_MESSAGES.GET_COUNT_UNREAD_NOTIFICATION_SUCCESS,
    total_unread: result
  })
}
export const createNotificationController = async (
  req: Request<ParamsDictionary, any, CreateNotificationReqBody, any>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const result = await notificationService.createNotification({
    user_id,
    payload: req.body
  })
  return res.json({
    message: NOTIFICATION_MESSAGES.CREATE_NOTIFICATION_SUCCESS,
    result
  })
}
