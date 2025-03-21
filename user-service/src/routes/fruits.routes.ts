import { Router } from 'express'
import { getFruitInformationByByNameController } from '~/controllers/fruits.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /fruits
const fruitsRouter = Router()

/**
 * Description: Get fruit by name
 * Path: /:name
 * Method: GET
 * **/
fruitsRouter.get('/:name', accessTokenValidator, wrapRequestHandler(getFruitInformationByByNameController))

export default fruitsRouter
