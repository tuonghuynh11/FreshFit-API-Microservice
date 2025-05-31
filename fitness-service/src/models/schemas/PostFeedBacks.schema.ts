import { ObjectId } from 'mongodb'
import { PostFeedbackStatus, PostFeedbackType } from '~/constants/enums'

// Swagger UI Express Comment Format

interface PostFeedbackModel {
  _id?: ObjectId
  user_id: ObjectId
  type?: PostFeedbackType
  comment: string
  medias?: string[]
  status?: PostFeedbackStatus
  created_at?: Date
  updated_at?: Date
}

export default class PostFeedback {
  _id?: ObjectId
  user_id: ObjectId
  type?: PostFeedbackType
  medias?: string[]
  comment: string
  status?: PostFeedbackStatus
  created_at?: Date
  updated_at?: Date
  constructor(postFeedback: PostFeedbackModel) {
    const date = new Date()
    this._id = postFeedback._id
    this.user_id = postFeedback.user_id
    this.medias = postFeedback.medias || []
    this.type = postFeedback.type || PostFeedbackType.Published
    this.comment = postFeedback.comment
    this.created_at = postFeedback.created_at || date
    this.updated_at = postFeedback.updated_at || date
    this.status = postFeedback.status || PostFeedbackStatus.Uncompleted
  }
}
