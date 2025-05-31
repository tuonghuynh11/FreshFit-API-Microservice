import { Filter, ObjectId } from 'mongodb'
import databaseService from './database.services'
import { PostStatus, PostTags, PostType, ReactionType, UserRole } from '~/constants/enums'
import { POST_FEEDBACK_MESSAGES, POST_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import {
  CommentPostReqBody,
  PostReqBody,
  ReactPostReqBody,
  RejectPostReqBody,
  UpdatePostFeedbackReqBody,
  UpdatePostReqBody
} from '~/models/requests/Post.requests'
import Post from '~/models/schemas/Post.schema'
import { omit } from 'lodash'
import PostFeedback from '~/models/schemas/PostFeedBacks.schema'
import PostReaction from '~/models/schemas/PostReaction.schema'
import PostComment from '~/models/schemas/PostComment.schema'

class PostService {
  async search({
    search,
    page,
    limit,
    type,
    status,
    tags,
    sort_by = 'created_at',
    order_by = 'ASC',
    user_id
  }: {
    search?: string
    type?: string
    status?: string
    tags?: string
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    user_id: string
  }) {
    const conditions: Filter<Post> = {}
    if (search) {
      conditions.title = {
        $regex: search,
        $options: 'i'
      }
    }

    if (type) {
      // type : "Expert_Post|Achievement"
      const typeFilter: PostType[] = type.split('|').map((t) => t.trim() as PostType)
      conditions.type = {
        $in: typeFilter
      }
    }

    if (status) {
      const statusFilter: PostStatus[] = status.split('|').map((t) => t.trim() as PostStatus)
      conditions.status = {
        $in: statusFilter
      }
    }

    if (tags) {
      const tagsFilter: PostTags[] = tags.split('|').map((t) => t.trim() as PostTags)
      conditions.tags = {
        $in: tagsFilter
      }
    }

    const [posts, total] = await Promise.all([
      databaseService.posts
        .find(conditions, {
          skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
          limit: Number(limit),
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.posts.countDocuments(conditions)
    ])

    const reactionTypeArray = Object.values(ReactionType)
    const reactions = await Promise.all(
      posts.map((post) => {
        return Promise.all([
          databaseService.postReactions.findOne({
            postId: post._id,
            user_id: new ObjectId(user_id)
          }),
          ...reactionTypeArray.map((reaction) =>
            databaseService.postReactions.countDocuments({
              postId: post._id,
              reaction
            })
          )
        ])
      })
    )
    const bookmarks = await Promise.all(
      posts.map((post: Post) => {
        return databaseService.postBookmarks.findOne({
          postId: post._id,
          user_id: new ObjectId(user_id)
        })
      })
    )
    const result = posts.map((post: Post, index: number) => {
      const total_comments = post.comments?.length
      const reactionResponseObject: any = {}
      reactionResponseObject.current_user_react = reactions[index][0]
      reactionTypeArray.forEach((reaction: string, i: number) => {
        reactionResponseObject[reaction] = reactions[index][i + 1]
      })

      return {
        ...omit(post, ['comments', 'reactions']),
        reactions: reactionResponseObject,
        isBookmark: !!bookmarks[index],
        total_comments
      }
    })
    return {
      posts: result,
      total
    }
  }

  async getById({ id, user_id }: { id: string; user_id: string }) {
    const post = await databaseService.posts.findOne({
      _id: new ObjectId(id)
    })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const total_comments = post.comments?.length
    const reactionTypeArray = Object.values(ReactionType)
    const [currentUserReactThisPost, isBookmark, ...reactions] = await Promise.all([
      databaseService.postReactions.findOne({
        postId: post._id,
        user_id: new ObjectId(user_id)
      }),
      databaseService.postBookmarks.findOne({
        postId: post._id,
        user_id: new ObjectId(user_id)
      }),
      ...reactionTypeArray.map((reaction) =>
        databaseService.postReactions.countDocuments({
          postId: post._id,
          reaction
        })
      )
    ])
    const reactionResponseObject: any = {}
    reactionResponseObject.current_user_react = currentUserReactThisPost
    reactionTypeArray.forEach((reaction: string, index: number) => {
      reactionResponseObject[reaction] = reactions[index]
    })
    return {
      ...omit(post, ['comments', 'reactions']),
      reactions: reactionResponseObject,
      isBookmark: !!isBookmark,
      total_comments
    }
  }

  async create({ post }: { post: PostReqBody }) {
    const newPost = new Post({
      user_id: new ObjectId(post.user_id),
      ...omit(post, ['user_id'])
    })
    const postInserted = await databaseService.posts.insertOne(newPost)

    return {
      ...omit(newPost, ['comments', 'reactions']),
      _id: postInserted.insertedId
    }
  }
  async update({
    id,
    updatePost,
    user_id,
    role
  }: {
    id: string
    updatePost: UpdatePostReqBody
    user_id: string
    role: UserRole
  }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (post.status === PostStatus.Pending && role === UserRole.Expert) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_IS_WAITING_FOR_APPROVAL,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    let result: any = {}
    if (role === UserRole.Admin) {
      result = await databaseService.posts.findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $set: {
            ...updatePost
          },
          $currentDate: {
            updated_at: true
          }
        },
        {
          returnDocument: 'after' // Trả về giá trị mới
        }
      )
    } else {
      if (post.user_id.toString() !== user_id) {
        throw new ErrorWithStatus({
          message: POST_MESSAGES.UNAUTHORIZED_UPDATE_POST,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      const updatePostTemp = new Post({
        ...omit(post, ['_id']),
        ...updatePost,
        status: PostStatus.Pending,
        parentId: new ObjectId(id),
        postFeedBacks: []
      })
      const postTemp = await databaseService.posts.insertOne(updatePostTemp)
      result = {
        ...omit(updatePostTemp, ['comments', 'reactions']),
        _id: postTemp.insertedId
      }
    }

    return result
  }
  async delete({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (role !== UserRole.Admin && post.user_id.toString() !== user_id) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.UNAUTHORIZED_DELETE_POST,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const result = await databaseService.posts.deleteOne({ _id: new ObjectId(id) })

    return result
  }

  async updatePostStatus({ postId, status }: { postId: string; status: PostStatus }) {
    const post = await databaseService.posts.findOne({
      _id: new ObjectId(postId)
    })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (post.status === PostStatus.Published) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_ALREADY_PUBLISHED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const updatedPost = await databaseService.posts.findOneAndUpdate(
      {
        _id: new ObjectId(postId)
      },
      {
        $set: {
          status
        },
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )

    return updatedPost
  }
  async approvePost({ postId, user_id }: { postId: string; user_id: string }) {
    const post = await databaseService.posts.findOne({
      _id: new ObjectId(postId)
    })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (post.status === PostStatus.Published) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_ALREADY_PUBLISHED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    let result: any = {}
    if (post.parentId) {
      result = await databaseService.posts.findOneAndUpdate(
        {
          _id: post.parentId
        },
        {
          $set: {
            type: post.type,
            title: post.title,
            content: post.content,
            medias: post.medias,
            mediaType: post.mediaType,
            tags: post.tags,
            status: PostStatus.Published,
            approveBy: new ObjectId(user_id),
            postFeedBacks: post.postFeedBacks
          },
          $currentDate: {
            updated_at: true
          }
        },
        { returnDocument: 'after' }
      )
      await databaseService.posts.deleteOne({ _id: new ObjectId(postId) })
    } else {
      result = await databaseService.posts.findOneAndUpdate(
        {
          _id: new ObjectId(postId)
        },
        {
          $set: {
            status: PostStatus.Published,
            approveBy: new ObjectId(user_id)
          },
          $currentDate: {
            updated_at: true
          }
        },
        { returnDocument: 'after' }
      )
    }

    return result
  }
  async rejectPost({ postId, feedback, user_id }: { postId: string; feedback: RejectPostReqBody; user_id: string }) {
    const post = await databaseService.posts.findOne({
      _id: new ObjectId(postId)
    })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const newFeedback = new PostFeedback({
      user_id: new ObjectId(user_id),
      ...feedback,
      _id: new ObjectId()
    })
    const updatedPost = await databaseService.posts.findOneAndUpdate(
      {
        _id: new ObjectId(postId)
      },
      {
        $set: {
          status: PostStatus.Rejected
        },
        $push: {
          postFeedBacks: newFeedback
        },
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )
    return updatedPost
  }
  async updatePostFeedback({
    postId,
    feedbackId,
    feedback,
    user_id
  }: {
    postId: string
    feedbackId: string
    feedback: UpdatePostFeedbackReqBody
    user_id: string
  }) {
    const post = await databaseService.posts.findOne({
      _id: new ObjectId(postId)
    })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const temp = post.postFeedBacks!
    const feedbackExist = temp.find((f: PostFeedback) => f._id!.toString() === feedbackId)
    if (!feedbackExist) {
      throw new ErrorWithStatus({
        message: POST_FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    feedbackExist.comment = feedback.comment ?? feedbackExist.comment
    feedbackExist.medias = feedback.medias ?? feedbackExist.medias
    feedbackExist.status = feedback.status ?? feedbackExist.status

    const updatedPost = await databaseService.posts.findOneAndUpdate(
      {
        _id: new ObjectId(postId)
      },
      {
        $set: {
          postFeedBacks: [...temp!]
        },

        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )
    return feedbackExist
  }

  async reactPost({
    id,
    user_id,
    role,
    reactionBody
  }: {
    id: string
    user_id: string
    role: UserRole
    reactionBody: ReactPostReqBody
  }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (post.status !== PostStatus.Published) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_IS_UNPUBLISHED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const existedReaction = await databaseService.postReactions.findOne({
      postId: new ObjectId(id),
      user_id: new ObjectId(reactionBody.user_id)
    })
    if (existedReaction) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_ALREADY_REACTED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const newReaction = new PostReaction({
      postId: new ObjectId(id),
      user_id: new ObjectId(reactionBody.user_id),
      reaction: reactionBody.reaction
    })
    const insertedReaction = await databaseService.postReactions.insertOne(newReaction)

    const result = await databaseService.posts.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: {
          reactions: insertedReaction.insertedId
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      _id: insertedReaction.insertedId,
      ...newReaction
    }
  }
  async getReactionsOfPost({ id, user_id }: { id: string; user_id: string }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const reactionTypeArray = Object.values(ReactionType)
    const [currentUserReactThisPost, ...reactions] = await Promise.all([
      databaseService.postReactions.findOne({
        postId: post._id,
        user_id: new ObjectId(user_id)
      }),
      ...reactionTypeArray.map((reaction) =>
        databaseService.postReactions.countDocuments({
          postId: post._id,
          reaction
        })
      )
    ])
    const reactionResponseObject: any = {}
    reactionResponseObject.current_user_react = currentUserReactThisPost
    reactionTypeArray.forEach((reaction: string, index: number) => {
      reactionResponseObject[reaction] = reactions[index]
    })
    return reactionResponseObject
  }

  async deleteReactionOfPost({ id, user_id, reactionId }: { id: string; user_id: string; reactionId: string }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const reaction = await databaseService.postReactions.findOne({ _id: new ObjectId(reactionId) })
    if (!reaction) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_REACTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (reaction.user_id.toString() !== user_id) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.UNAUTHORIZED_DELETE_POST_REACTION,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    await Promise.all([
      databaseService.postReactions.deleteOne({ _id: new ObjectId(reactionId) }),
      databaseService.posts.findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $pull: {
            reactions: new ObjectId(reactionId)
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    return null
  }
  async commentPost({
    postId,
    user_id,
    commentBody
  }: {
    postId: string
    user_id: string
    commentBody: CommentPostReqBody
  }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(postId) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const comment = new PostComment({
      user_id: new ObjectId(user_id),
      postId: post._id,
      content: commentBody.content,
      parentCommentId: commentBody.parentCommentId ? new ObjectId(commentBody.parentCommentId) : undefined,
      _id: new ObjectId()
    })
    const commentInserted = await databaseService.postComments.insertOne(comment)
    await databaseService.posts.updateOne(
      {
        _id: new ObjectId(postId)
      },
      {
        $push: {
          comments: commentInserted.insertedId
        }
      }
    )
    return comment
  }

  async getCommentsOfPost({
    page,
    limit,
    sort_by = 'created_at',
    order_by = 'DESC',
    postId
  }: {
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    postId: string
  }) {
    const conditions: Filter<PostComment> = {
      postId: new ObjectId(postId),
      parentCommentId: undefined
    }

    const [comments, total] = await Promise.all([
      databaseService.postComments
        .find(conditions, {
          skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
          limit: Number(limit),
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.postComments.countDocuments(conditions)
    ])

    // Get children comments if exists
    const childrenComments = await Promise.all(
      comments.map((comment: PostComment) => {
        return databaseService.postComments
          .find(
            {
              parentCommentId: comment._id
            },
            {
              sort: {
                created_at: 1
              }
            }
          )
          .toArray()
      })
    )
    const result = comments.map((comment: PostComment, index: number) => {
      return {
        ...comment,
        children: childrenComments[index]
      }
    })

    return {
      comments: result,
      total
    }
  }

  async deleteCommentOfPost({ id, user_id, commentId }: { id: string; user_id: string; commentId: string }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const [comment, childComments] = await Promise.all([
      databaseService.postComments.findOne({ _id: new ObjectId(commentId) }),
      databaseService.postComments.find({ parentCommentId: new ObjectId(commentId) }).toArray()
    ])
    if (!comment) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_COMMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (comment.user_id.toString() !== user_id) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.UNAUTHORIZED_DELETE_POST_COMMENT,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    if (childComments.length > 0) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_COMMENT_HAS_CHILDREN,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await Promise.all([
      databaseService.postComments.deleteOne({ _id: new ObjectId(commentId) }),
      databaseService.posts.updateOne(
        {
          _id: new ObjectId(id)
        },
        {
          $pull: {
            comments: new ObjectId(commentId)
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    return null
  }
}
const postService = new PostService()
export default postService
