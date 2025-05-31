import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import bookmarkService from '~/services/bookmark.services'
import { BOOKMARK_MESSAGES } from '~/constants/messages'

export const bookmarkPostController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { postId } = req.params
  const result = await bookmarkService.bookmarkPost({ id: postId, user_id })

  return res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_POST_SUCCESS,
    bookmark: result
  })
}
export const getBookmarkOfUserController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { page, limit, sort_by, order_by } = req.query
  const { bookmarks, total } = await bookmarkService.getBookmarksOfUser({
    page,
    limit,
    sort_by,
    order_by,
    user_id
  })
  return res.json({
    message: BOOKMARK_MESSAGES.GET_BOOKMARK_SUCCESS,
    result: {
      bookmarks,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const deleteBookmarkController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { bookmarkId } = req.params
  const result = await bookmarkService.deleteBookmark({ bookmarkId, user_id })

  return res.json({
    message: BOOKMARK_MESSAGES.DELETE_BOOKMARK_SUCCESS
  })
}
