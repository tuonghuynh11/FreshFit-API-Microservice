import { ObjectId } from 'mongodb'

interface ChatRoomType {
  _id?: ObjectId
  user_1: ObjectId
  user_2: ObjectId
  title: string
  chatDetails?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export default class ChatRoom {
  _id?: ObjectId
  user_1: ObjectId
  user_2: ObjectId
  chatDetails: ObjectId[]
  title: string
  created_at?: Date
  updated_at?: Date

  constructor(chatroomType: ChatRoomType) {
    const date = new Date()
    this._id = chatroomType._id
    this.title = chatroomType.title
    this.user_1 = chatroomType.user_1
    this.user_2 = chatroomType.user_2
    this.chatDetails = chatroomType.chatDetails || []
    this.created_at = chatroomType.created_at || date
    this.updated_at = chatroomType.updated_at || date
  }
}
