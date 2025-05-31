import { ObjectId } from 'mongodb'

interface ChatDetailType {
  _id?: ObjectId
  sender: ObjectId
  message: string
  image?: string
  created_at?: Date
  updated_at?: Date
  isRead?: boolean
}

export default class ChatDetail {
  _id?: ObjectId
  sender: ObjectId
  message: string
  image?: string
  created_at?: Date
  updated_at?: Date
  isRead?: boolean

  constructor(chatDetailType: ChatDetailType) {
    const date = new Date()
    this._id = chatDetailType._id
    this.sender = chatDetailType.sender
    this.message = chatDetailType.message
    this.image = chatDetailType.image || undefined
    this.isRead = chatDetailType.isRead || false
    this.created_at = chatDetailType.created_at || date
    this.updated_at = chatDetailType.updated_at || date
  }
}
