import { Router } from 'express'
import {
  deleteUserChallengeController,
  finishChallengeController,
  getGetUserChallengeProgressByIdController,
  getGetUserChallengeProgressController,
  getUserChallengeOverviewByChallengeIdController,
  getUserChallengeOverviewController,
  searchUserChallengeParticipationController,
  startChallengeController,
  updateProgressEachDayController
} from '~/controllers/user-challenge-participation.controllers'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import {
  getUserChallengeProgressValidator,
  startChallengeValidator,
  updateProgressEachDayValidator,
  userChallengeParticipationSearchValidator
} from '~/middlewares/user-challenge-participation.middlwares'
import { accessTokenValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /user-challenge-participation
const userChallengeParticipationRouter = Router()

/**
 * Description: Get list of challenge that user joined
 * Path: /? search= &page=1&limit=10&status=Ongoing
 * Method: GET
 * **/
userChallengeParticipationRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  userChallengeParticipationSearchValidator,
  wrapRequestHandler(searchUserChallengeParticipationController)
)

/**
 * Description: Update progress each day
 * Path: /user-challenge-participation/progress/:userChallengeParticipationProgressId
 * Method: PATCH
 * Body: {
 *  completed_workouts: string[]
 *  completed_nutritions : string[]
 * }
 * **/
userChallengeParticipationRouter.patch(
  '/progress/:userChallengeParticipationProgressId',
  accessTokenValidator,
  updateProgressEachDayValidator,
  wrapRequestHandler(updateProgressEachDayController)
)

/**
 * Description: Get user challenge progress
 * Path: /:id/progress? week=1 &day=1
 * Method: Get
 * Body:{
 *
 * }
 * **/
userChallengeParticipationRouter.get(
  '/:id/progress',
  accessTokenValidator,
  verifiedUSerValidator,
  getUserChallengeProgressValidator,
  wrapRequestHandler(getGetUserChallengeProgressController)
)
/**
 * Description: Get user challenge progress by challenge id
 * Path: /challenges/:id/progress? week=1 &day=1
 * Method: Get
 * Body:{
 *
 * }
 * **/
userChallengeParticipationRouter.get(
  '/challenges/:id/progress',
  accessTokenValidator,
  verifiedUSerValidator,
  getUserChallengeProgressValidator,
  wrapRequestHandler(getGetUserChallengeProgressByIdController)
)

/**
 * Description: Get user challenge overview
 * Path: /:id/overview
 * Method: Get
 * Body: {
 * }
 * **/
userChallengeParticipationRouter.get(
  '/:id/overview',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(getUserChallengeOverviewController)
)
/**
 * Description: Get user challenge overview by challenge id
 * Path:  /challenges/:id/overview
 * Method: Get
 * Body: {
 * }
 * **/
userChallengeParticipationRouter.get(
  '/challenges/:id/overview',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(getUserChallengeOverviewByChallengeIdController)
)

/**
 * Description:  Finish challenge
 * Path: /:id/finish
 * Method: Patch
 * Body:
 * **/
userChallengeParticipationRouter.patch(
  '/:id/finish',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(finishChallengeController)
)
/**
 * Description:  Start challenge
 * Path: /:id/start
 * Method: Post
 * Body: {
 *  start_date: Date
 * }
 * **/
userChallengeParticipationRouter.post(
  '/:id/start',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  startChallengeValidator,
  wrapRequestHandler(startChallengeController)
)

/**
 * Description:  Delete user challenge
 * Path: /:id
 * Method: Delete
 * Body: {
 * }
 * **/
userChallengeParticipationRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  // adminRoleValidator,
  wrapRequestHandler(deleteUserChallengeController)
)

export default userChallengeParticipationRouter
