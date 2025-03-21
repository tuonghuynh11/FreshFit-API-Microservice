import { ObjectId } from 'mongodb'

// Swagger UI Express Comment Format

interface PostCommentType {
  _id?: ObjectId
  user_id: ObjectId
  postId: ObjectId
  content: string
  parentCommentId: ObjectId
  created_at?: Date
}

export default class PostComment {
  _id?: ObjectId
  user_id: ObjectId
  postId: ObjectId
  content: string
  parentCommentId?: ObjectId
  created_at?: Date
  constructor(postComment: PostCommentType) {
    const date = new Date()
    this._id = postComment._id
    this.user_id = postComment.user_id
    this.content = postComment.content
    this.parentCommentId = postComment.parentCommentId
    this.created_at = postComment.created_at || date
    this.postId = postComment.postId
  }
}
