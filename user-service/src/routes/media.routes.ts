import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /medias
const mediaRouter = Router()

mediaRouter.post('/videos', accessTokenValidator, wrapRequestHandler(uploadVideoController))
mediaRouter.post('/images', accessTokenValidator, wrapRequestHandler(uploadImageController))
export default mediaRouter
