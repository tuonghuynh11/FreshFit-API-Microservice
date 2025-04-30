import { Router } from 'express'
import {
  countUnreadNotificationsController,
  createNotificationController,
  getNotificationsController,
  markAllReadNotificationsController,
  markReadNotificationsController
} from '~/controllers/notifications.controllers'
import { createNotificationValidator, notificationsSearchValidator } from '~/middlewares/notifications.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'

//  Base route: /notifications
const notificationsRouter = Router()

/**
 * Description: Get all notifications
 * Path: ? page = 1
 *        & limit = 10
 *        & type = NotificationType
 *        & order_by
 *        & sort_by
 * Method: GET
 * **/
notificationsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  paginationNavigator,
  notificationsSearchValidator,
  wrapRequestHandler(getNotificationsController)
)

/**
 * Description: Count total unread notifications
 * Path: /count-unread
 * Method: GET
 * **/
notificationsRouter.get(
  '/count-unread',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(countUnreadNotificationsController)
)

/**
 * Description: Mark read notifications
 * Path: /notifications/mark-read
 * Method: POST
 * Body: { notification_ids: string[] }
 * **/
notificationsRouter.post(
  '/mark-read',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(markReadNotificationsController)
)
/**
 * Description: Mark all read notifications
 * Path: /notifications/mark-all-read
 * Method: POST
 * Body: {}
 * **/
notificationsRouter.post(
  '/mark-all-read',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(markAllReadNotificationsController)
)

/**
 * Description: Create a notification
 * Path: /notifications/create
 * Method: Post
 * Body: {
    "type": "", // Notification type
    "title":"",
    "message":"",
    "action": "", 

  }
 * **/
notificationsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUSerValidator,
  createNotificationValidator,
  wrapRequestHandler(createNotificationController)
)

export default notificationsRouter
