import { Router } from 'express'
import {
  addReportController,
  getReportByIdController,
  searchReportsController,
  updateReportStatusController
} from '~/controllers/reports.controllers'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { addReportValidator } from '~/middlewares/reports.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
const reportsRouter = Router()
// Base route: /reports
/**
 * Description: Get reports by name
 * Path: ?search = "" &page = 1 &limit = 10 & order_by & sort_by
 * Method: GET
 * **/
reportsRouter.get(
  '/',
  accessTokenValidator,
  paginationNavigator,
  adminRoleValidator,
  wrapRequestHandler(searchReportsController)
)

/**
 * Description: Get report detail
 * Path: /:id
 * Method: Get
 * Body:
 * **/
reportsRouter.get(
  '/:id',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getReportByIdController)
)

/**
 * Description: Add new report
 * Path: /
 * Method: Post
 * Body: {
 * title: string
 * message: string
 * image: string?
 * }
 * **/
reportsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUSerValidator,
  addReportValidator,
  wrapRequestHandler(addReportController)
)
/**
 * Description: Update report status
 * Path: /read
 * Method: Put
 * Body: {
 * reportIds: string []
 * status: ReportStatus
 * }
 * **/
reportsRouter.put(
  '/status',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(updateReportStatusController)
)

/**
 * Description: Update ingredient
 * Path: /:id
 * Method: Patch
 * Body: {
 * name: string
 * description: string
 * calories: number
 * image: string
 * cab?: number
 * sodium?: number
 * sugar?: number
 * cholesterol?: number
 * fat?: number
 * protein?: number
 * }
 * **/
// reportsRouter.patch(
//   '/:id',
//   accessTokenValidator,
//   verifiedUSerValidator,
//   adminRoleValidator,
//   updateIngredientValidator,
//   filterMiddleware<UpdateIngredientReqBody>([
//     'name',
//     'description',
//     'calories',
//     'image',
//     'cab',
//     'sodium',
//     'sugar',
//     'cholesterol',
//     'fat',
//     'protein'
//   ]),
//   wrapRequestHandler(updateIngredientController)
// )

// /**
//  * Description: Delete Ingredient
//  * Path:/:id
//  * Method: Delete
//  * Body:
//  * **/
// reportsRouter.delete(
//   '/:id',
//   accessTokenValidator,
//   verifiedUSerValidator,
//   adminRoleValidator,
//   wrapRequestHandler(deleteIngredientController)
// )

export default reportsRouter
