import { PostFeedbackStatus, PostMediaType, PostStatus, PostTags, PostType, ReactionType } from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'

export interface PostReqBody {
  user_id: string
  type: PostType
  title: string
  content: string
  medias: string[]
  mediaType: PostMediaType
  tags: PostTags[]
  status?: PostStatus
}
export interface UpdatePostReqBody {
  type: PostType
  title: string
  content: string
  medias: string[]
  mediaType: PostMediaType
  tags: PostTags[]
  status?: PostStatus
}
export interface RejectPostReqBody {
  comment: string
  medias: string[]
}
export interface UpdatePostFeedbackReqBody {
  comment?: string
  medias?: string[]
  status?: PostFeedbackStatus
}
export interface PostReqQuery extends PaginationReqQuery, Filter {
  type: string
  status: string
  tags: string
}

export interface ReactPostReqBody {
  user_id: string
  reaction: ReactionType
}
