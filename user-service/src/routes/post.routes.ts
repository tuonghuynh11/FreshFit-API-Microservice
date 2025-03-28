import { Router } from 'express'
import { UserRole } from '~/constants/enums'
import { getAllExerciseController } from '~/controllers/exercises.controllers'
import {
  approvePostController,
  createPostController,
  deletePostController,
  deleteReactionOfPostController,
  getPostByIdController,
  getReactionsOfPostController,
  reactPostController,
  rejectPostController,
  searchPostController,
  updatePostController,
  updatePostFeedbackController
} from '~/controllers/posts.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import {
  createPostValidator,
  postsSearchValidator,
  reactPostValidator,
  rejectPostValidator,
  updatePostFeedbackValidator,
  updatePostValidator
} from '~/middlewares/posts.middlewares'
import { roleValidator } from '~/middlewares/roles.middlewares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { UpdatePostReqBody } from '~/models/requests/Post.requests'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /posts
const postsRouter = Router()

/**
 * Description: Filter post
 * Path: ? search = ""
 *        & page = 1
 *        & limit = 10
 *        & type = PostType | PostType
 *        & status= PostStatus | PostTags
 *        & tags = PostTags | PostTags
 *        & order_by
 *        & sort_by
 * Method: GET
 * **/
postsRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  postsSearchValidator,
  wrapRequestHandler(searchPostController)
)

/**
 * Description: Get all exercise
 * Path: /all
 * Method: GET
 * **/
postsRouter.get('/all', accessTokenValidator, wrapRequestHandler(getAllExerciseController))

/**
 * Description: Get post detail
 * Path: /posts/:id
 * Method: Get
 * Body:
 * **/
postsRouter.get('/:id', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(getPostByIdController))

/**
 * Description: Create a post
 * Path: /posts/create
 * Method: Post
 * Body: {
    "user_id": "user-uuid",
    "type": "Expert_Post", // PostType
    "title":"",
    "content":"",
    "medias":[],// urls
    "mediaType": "Image", // ["Image", "Video"], PostMediaType
    "tags": [""], PostTags
    "status": "", // PostStatus

  }
 * **/
postsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUSerValidator,
  roleValidator([UserRole.Admin, UserRole.Expert]),
  createPostValidator,
  wrapRequestHandler(createPostController)
)

/**
 * Description: Approve a post (Admin only)
 * Path: /posts/approve/:postId
 * Method: Patch
 * Body: {
 * }
 * **/
postsRouter.patch(
  '/approve/:postId',
  accessTokenValidator,
  verifiedUSerValidator,
  roleValidator([UserRole.Admin]),
  wrapRequestHandler(approvePostController)
)
/**
 * Description: Reject a post (Admin only)
 * Path: /posts/reject/:postId
 * Method: Post
 * Body: {
 * "comment": "",
    "medias": [],
 * }
 * **/
postsRouter.post(
  '/reject/:postId',
  accessTokenValidator,
  verifiedUSerValidator,
  roleValidator([UserRole.Admin]),
  rejectPostValidator,
  wrapRequestHandler(rejectPostController)
)

/**
 * Description: Update a post feedback (Admin only for published)
 * Path: /posts/:postId/feedbacks/:feedbackId
 * Method: Put
 * Body: {
    "comment": "",
    "medias": [],
    "status": "" // ["Completed", "Uncompleted"]
}
 * **/
postsRouter.put(
  '/:postId/feedbacks/:feedbackId',
  accessTokenValidator,
  verifiedUSerValidator,
  roleValidator([UserRole.Admin]),
  updatePostFeedbackValidator,
  wrapRequestHandler(updatePostFeedbackController)
)

/**
 * Description: Update Post
 * Path: /posts/:postId
 * Method: Patch
 * Body: 
 * {
    "type": "Expert_Post",
    "title":"",
    "content":"",
    "medias":[],// urls
    "mediaType": "Image", // ["Image", "Video"],
    "tags": [""],
    "status": ['Pending',"Published","Rejected","Removed"]
}
 * **/
postsRouter.patch(
  '/:postId',
  accessTokenValidator,
  verifiedUSerValidator,
  roleValidator([UserRole.Admin, UserRole.Expert]),
  updatePostValidator,
  filterMiddleware<UpdatePostReqBody>(['type', 'title', 'content', 'medias', 'mediaType', 'tags', 'status']),
  wrapRequestHandler(updatePostController)
)

/**
 * Description: Delete Post
 * Path: /posts/:postId
 * Method: Delete
 * Body:
 * **/
postsRouter.delete(
  '/:postId',
  accessTokenValidator,
  verifiedUSerValidator,
  roleValidator([UserRole.Admin, UserRole.Expert]),
  wrapRequestHandler(deletePostController)
)

/**
 * Description: React a Post
 * Path: /posts/:postId/reactions
 * Method: POST
 * Body:
 * {
  "user_id":"user-uuid",
  "reaction":"" // ["Like","Love","Haha","Wow","Sad","Angry"]
}
 * **/
postsRouter.post(
  '/:postId/reactions',
  accessTokenValidator,
  verifiedUSerValidator,
  reactPostValidator,
  wrapRequestHandler(reactPostController)
)

/**
 * Description: Get reactions count for a post
 * Path: /posts/:postId/reactions
 * Method: GET
 * Body:
 * **/
postsRouter.get(
  '/:postId/reactions',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(getReactionsOfPostController)
)
/**
 * Description: Remove post reaction
 * Path: /posts/:postId/reactions/:reactionId
 * Method: DELETE
 * Body:
 * **/
postsRouter.delete(
  '/:postId/reactions/:reactionId',
  accessTokenValidator,
  verifiedUSerValidator,
  wrapRequestHandler(deleteReactionOfPostController)
)

export default postsRouter
