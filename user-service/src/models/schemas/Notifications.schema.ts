import { ObjectId } from 'mongodb'

interface NotificationType {
  _id?: ObjectId
  user_id: ObjectId
  title: string
  message: string
  type: NotificationType
  created_at?: Date
  updated_at?: Date
}

export default class Notifications {
  _id?: ObjectId
  user_id: ObjectId
  title: string
  message: string
  type: NotificationType
  created_at?: Date
  updated_at?: Date

  constructor(notificationType: NotificationType) {
    const date = new Date()
    this._id = notificationType._id
    this.user_id = notificationType.user_id
    this.title = notificationType.title
    this.message = notificationType.message
    this.type = notificationType.type
    this.created_at = notificationType.created_at || date
    this.updated_at = notificationType.updated_at || date
  }
}
