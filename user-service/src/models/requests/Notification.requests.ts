import { NotificationType } from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'

export interface NotificationReqQuery extends PaginationReqQuery {
  type: NotificationType
  sort_by: string
  order_by: string
}

export interface MarkReadNotificationReqBody {
  notification_ids: string[]
}

export interface CreateNotificationReqBody {
  type: NotificationType
  title: string
  message: string
  action?: string // Action to be performed when the notification is clicked
}
