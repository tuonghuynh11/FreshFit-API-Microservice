import './traces'
import express from 'express'
import databaseService from './services/database.services'
import { envConfig } from './constants/config'
import cors, { CorsOptions } from 'cors'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import helmet from 'helmet'
import { initFolder } from './utils/file'
import { versionOneRouter } from './routes/index.routes'
import morganMiddleware from './middlewares/morgan'
import { initCronModule } from './corn'
const app = express()
const PORT = envConfig.port

databaseService.connect().then(() => {
  databaseService.createIndexes()
})
initFolder()
initCronModule()
//Use Helmet
app.use(helmet())
const corsOptions: CorsOptions = {
  origin: '*'
}
app.use(cors(corsOptions))
app.use(morganMiddleware)

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello!')
})

// Use the versioned router with a single prefix
app.use('/api/v1', versionOneRouter)

//Error Handler must be place in the end of handlers
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}!`)
})
