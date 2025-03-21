import { ObjectId } from 'mongodb'
import { PostMediaType, PostStatus, PostTags, PostType } from '~/constants/enums'

// Swagger UI Express Comment Format

interface PostTypeSM {
  _id?: ObjectId
  user_id: ObjectId
  type: PostType
  title: string
  content: string
  medias: string[]
  mediaType: PostMediaType
  tags: PostTags[]
  status: PostStatus
  approveBy: ObjectId
  comments: ObjectId[]
  reactions: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export default class Post {
  _id?: ObjectId
  user_id: ObjectId
  type: PostType
  title: string
  content: string
  medias: string[]
  mediaType: PostMediaType
  tags?: PostTags[]
  status?: PostStatus
  approveBy?: ObjectId
  comments?: ObjectId[]
  reactions?: ObjectId[]
  created_at?: Date
  updated_at?: Date
  constructor(post: PostTypeSM) {
    const date = new Date()
    this._id = post._id
    this.user_id = post.user_id
    this.type = post.type
    this.title = post.title
    this.content = post.content
    this.medias = post.medias
    this.mediaType = post.mediaType
    this.tags = post.tags || []
    this.status = post.status || PostStatus.Pending
    this.approveBy = post.approveBy
    this.comments = post.comments || []
    this.reactions = post.reactions || []
    this.created_at = post.created_at || date
    this.updated_at = post.updated_at || date
  }
}
