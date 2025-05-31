import { ObjectId } from 'mongodb'
import { ReactionType } from '~/constants/enums'

// Swagger UI Express Comment Format

interface PostReactionType {
  _id?: ObjectId
  user_id: ObjectId
  postId: ObjectId
  reaction: ReactionType
  created_at?: Date
}

export default class PostReaction {
  _id?: ObjectId
  user_id: ObjectId
  reaction: ReactionType
  postId: ObjectId
  created_at?: Date
  constructor(postReaction: PostReactionType) {
    const date = new Date()
    this._id = postReaction._id
    this.user_id = postReaction.user_id
    this.reaction = postReaction.reaction
    this.created_at = postReaction.created_at || date
    this.postId = postReaction.postId
  }
}
