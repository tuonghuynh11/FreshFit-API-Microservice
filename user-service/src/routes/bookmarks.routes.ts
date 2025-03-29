import { Router } from 'express'
import {
  bookmarkPostController,
  deleteBookmarkController,
  getBookmarkOfUserController
} from '~/controllers/bookmarks.controllers'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /bookmarks
const bookmarksRouter = Router()

/**
 * Description: Bookmark a Post
 * Path: /bookmarks/:postId
 * Method: POST
 * Body:
 * **/
bookmarksRouter.post(
  '/:postId',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(bookmarkPostController)
)

/**
 * Description: Get all bookmarked posts for a user
 * Path: /bookmarks
 * Method: GET
 * Body:
 * **/
bookmarksRouter.get(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  paginationNavigator,
  wrapRequestHandler(getBookmarkOfUserController)
)

/**
 * Description: Remove a post from bookmarks
 * Path: /bookmarks/:bookmarkId
 * Method: DELETE
 * Body:
 * **/
bookmarksRouter.delete(
  '/:bookmarkId',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteBookmarkController)
)

export default bookmarksRouter
