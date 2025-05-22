import { Router } from 'express'
import { getStatisticAboutTopController } from '~/controllers/statistics.controllers'
import { topStatisticValidator } from '~/middlewares/statistic.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /statistics
const statisticsRouter = Router()

/**
 * Description: Get top menu, workout_set and exercise
 * Path: /top
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/top',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  topStatisticValidator,
  wrapRequestHandler(getStatisticAboutTopController)
)

export default statisticsRouter
