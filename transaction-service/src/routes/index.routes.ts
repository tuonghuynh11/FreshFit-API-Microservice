import express from 'express'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import YAML from 'yaml'
import fs from 'fs'
import transactionsRouter from './transactions.routes'

const file = fs.readFileSync(path.resolve('slda-swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)
const versionOneRouter = express.Router()

versionOneRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
versionOneRouter.use('/transactions', transactionsRouter)
export { versionOneRouter }
