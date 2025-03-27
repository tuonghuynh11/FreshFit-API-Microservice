import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { POST_FEEDBACK_MESSAGES, POST_MESSAGES } from '~/constants/messages'
import {
  PostReqBody,
  PostReqQuery,
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
