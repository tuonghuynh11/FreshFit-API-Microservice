import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { POST_FEEDBACK_MESSAGES, POST_MESSAGES } from '~/constants/messages'
import {
  CommentPostReqBody,
  PostReqBody,
  PostReqQuery,
  ReactPostReqBody,
  RejectPostReqBody,
  UpdatePostFeedbackReqBody,
  UpdatePostReqBody
} from '~/models/requests/Post.requests'
import postService from '~/services/posts.services'

export const searchPostController = async (req: Request<ParamsDictionary, any, any, PostReqQuery>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { search, page, limit, type, tags, status, sort_by, order_by } = req.query
  const { posts, total } = await postService.search({
    search: search?.toString(),
    type,
    page,
    limit,
    tags,
    status,
    sort_by,
    order_by,
    user_id
  })
  return res.json({
    message: POST_MESSAGES.GET_POST_SUCCESS,
    result: {
      posts,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const createPostController = async (req: Request<ParamsDictionary, any, PostReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const post = await postService.create({ post: req.body })

  return res.json({
    message: POST_MESSAGES.CREATE_POST_SUCCESS,
    post
  })
}
export const approvePostController = async (req: Request<ParamsDictionary, any, PostReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const postId = req.params.postId as string
  const post = await postService.approvePost({ postId, user_id })

  return res.json({
    message: POST_MESSAGES.APPROVE_POST_SUCCESS,
    post
  })
}
export const rejectPostController = async (req: Request<ParamsDictionary, any, RejectPostReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const postId = req.params.postId as string
  const post = await postService.rejectPost({ postId, feedback: req.body, user_id })

  return res.json({
    message: POST_MESSAGES.REJECT_POST_SUCCESS,
    post
  })
}
export const updatePostFeedbackController = async (
  req: Request<ParamsDictionary, any, UpdatePostFeedbackReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const postId = req.params.postId as string
  const feedbackId = req.params.feedbackId as string

  const post = await postService.updatePostFeedback({ postId, feedbackId, feedback: req.body, user_id })

  return res.json({
    message: POST_FEEDBACK_MESSAGES.UPDATE_POST_FEEDBACK_SUCCESS,
    post
  })
}

export const updatePostController = async (req: Request<ParamsDictionary, any, UpdatePostReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { postId } = req.params
  const result = await postService.update({ id: postId, updatePost: req.body, user_id, role })

  return res.json({
    message: POST_MESSAGES.UPDATE_POST_SUCCESS,
    post: result
  })
}
export const getPostByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const post = await postService.getById({ id, user_id })

  return res.json({
    message: POST_MESSAGES.GET_POST_DETAIL_SUCCESS,
    post
  })
}

export const deletePostController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId } = req.params
  const result = await postService.delete({ id: postId, user_id, role })

  return res.json({
    message: POST_MESSAGES.DELETE_POST_SUCCESS
  })
}
export const reactPostController = async (req: Request<ParamsDictionary, any, ReactPostReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId } = req.params
  const result = await postService.reactPost({ id: postId, user_id, role, reactionBody: req.body })

  return res.json({
    message: POST_MESSAGES.REACT_POST_SUCCESS,
    reaction: result
  })
}
export const getReactionsOfPostController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId } = req.params
  const result = await postService.getReactionsOfPost({ id: postId, user_id })

  return res.json({
    message: POST_MESSAGES.GET_REACTIONS_OF_POST_SUCCESS,
    reaction: result
  })
}
export const deleteReactionOfPostController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId, reactionId } = req.params
  const result = await postService.deleteReactionOfPost({ id: postId, reactionId, user_id })

  return res.json({
    message: POST_MESSAGES.DELETE_POST_REACTION_SUCCESS
  })
}

export const commentPostController = async (req: Request<ParamsDictionary, any, CommentPostReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId } = req.params
  const result = await postService.commentPost({ postId, user_id, commentBody: req.body })

  return res.json({
    message: POST_MESSAGES.COMMENT_POST_SUCCESS,
    comment: result
  })
}

export const getCommentsOfPostController = async (
  req: Request<ParamsDictionary, any, any, PostReqQuery>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { page, limit, sort_by, order_by } = req.query
  const { postId } = req.params
  const { comments, total } = await postService.getCommentsOfPost({
    page,
    limit,
    sort_by,
    order_by,
    postId
  })
  return res.json({
    message: POST_MESSAGES.GET_COMMENT_OF_POST_SUCCESS,
    result: {
      comments,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const deleteCommentOfPostController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId, commentId } = req.params
  const result = await postService.deleteCommentOfPost({ id: postId, commentId, user_id })

  return res.json({
    message: POST_MESSAGES.DELETE_POST_COMMENT_SUCCESS
  })
}
