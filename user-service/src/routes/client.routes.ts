import { Router } from 'express'
import { getAllClientController } from '~/controllers/clients.controllers'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /clients
const clientRouter = Router()

/**
 * Description: Get clients(users)
 * Path:
 * Method: GET
 *
 * **/
clientRouter.get('', wrapRequestHandler(getAllClientController))
export default clientRouter
