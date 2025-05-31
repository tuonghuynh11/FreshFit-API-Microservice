import HTTP_STATUS from '~/constants/httpStatus'
import { BOOKMARK_MESSAGES, POST_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import PostBookmark from '~/models/schemas/PostBookmark.schema'
import postService from './posts.services'
import { omit } from 'lodash'

class BookmarkService {
  async bookmarkPost({ id, user_id }: { id: string; user_id: string }) {
    const post = await databaseService.posts.findOne({ _id: new ObjectId(id) })
    if (!post) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const bookmark = await databaseService.postBookmarks.findOne({
      postId: new ObjectId(id),
      user_id: new ObjectId(user_id)
    })
    if (bookmark) {
      throw new ErrorWithStatus({
        message: POST_MESSAGES.POST_ALREADY_BOOKMARKED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const newBookmark = new PostBookmark({
      user_id: new ObjectId(user_id),
      postId: new ObjectId(id)
    })
    const bookmarkInserted = await databaseService.postBookmarks.insertOne(newBookmark)

    return {
      ...newBookmark,
      _id: bookmarkInserted.insertedId
    }
  }
  async getBookmarksOfUser({
    page,
    limit,
    sort_by = 'created_at',
    order_by = 'DESC',
    user_id
  }: {
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    user_id: string
  }) {
    const [bookmarks, total] = await Promise.all([
      databaseService.postBookmarks
        .find(
          { user_id: new ObjectId(user_id) },
          {
            sort: { [sort_by]: order_by === 'DESC' ? -1 : 1 },
            skip: (Number(page) - 1) * Number(limit),
            limit: Number(limit)
          }
        )
        .toArray(),
      databaseService.postBookmarks.countDocuments({
        user_id: new ObjectId(user_id)
      })
    ])
    const postDetails = await Promise.all(
      bookmarks.map((bookmark: PostBookmark) => {
        return postService.getById({ id: bookmark.postId.toString(), user_id })
      })
    )
    return {
      bookmarks: bookmarks.map((bookmark: PostBookmark, index: number) => {
        return {
          ...omit(bookmark, ['postId', 'user_id']),
          post: postDetails[index]
        }
      }),
      total
    }
  }
  async deleteBookmark({ bookmarkId, user_id }: { bookmarkId: string; user_id: string }) {
    const bookmark = await databaseService.postBookmarks.findOne({
      _id: new ObjectId(bookmarkId),
      user_id: new ObjectId(user_id)
    })
    if (!bookmark) {
      throw new ErrorWithStatus({
        message: BOOKMARK_MESSAGES.BOOKMARK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    await databaseService.postBookmarks.deleteOne({ _id: new ObjectId(bookmarkId) })
    return true
  }
}
const bookmarkService = new BookmarkService()
export default bookmarkService
