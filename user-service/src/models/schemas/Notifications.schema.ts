import { ObjectId } from 'mongodb'
import { NotificationType } from '~/constants/enums'

interface INotificationType {
  _id?: ObjectId
  user_id: ObjectId
  title: string
  message: string
  type: NotificationType
  action?: string // Action to be performed when the notification is clicked
  created_at?: Date
  updated_at?: Date
}

export default class Notifications {
  _id?: ObjectId
  user_id: ObjectId
  title: string
  message: string
  type: NotificationType
  action?: string // Action to be performed when the notification is clicked
  isRead?: boolean
  created_at?: Date
  updated_at?: Date

  constructor(notificationType: INotificationType) {
    const date = new Date()
    this._id = notificationType._id
    this.user_id = notificationType.user_id
    this.title = notificationType.title
    this.message = notificationType.message
    this.type = notificationType.type
    this.created_at = notificationType.created_at || date
    this.updated_at = notificationType.updated_at || date
    this.isRead = false
    this.action = notificationType.action || ''
  }
}
