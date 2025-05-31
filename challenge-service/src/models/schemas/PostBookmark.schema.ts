import { ObjectId } from 'mongodb'

// Swagger UI Express Comment Format

interface PostBookmarkType {
  _id?: ObjectId
  user_id: ObjectId
  postId: ObjectId
  created_at?: Date
}

export default class PostBookmark {
  _id?: ObjectId
  user_id: ObjectId
  postId: ObjectId
  created_at?: Date
  constructor(postBookmark: PostBookmarkType) {
    const date = new Date()
    this._id = postBookmark._id
    this.user_id = postBookmark.user_id
    this.postId = postBookmark.postId
    this.created_at = postBookmark.created_at || date
  }
}
