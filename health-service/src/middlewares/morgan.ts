import { Request } from 'express'
import morgan, { StreamOptions } from 'morgan'
import Logger from '~/utils/logger'

// Custom token for logging request details
morgan.token('body', (req: Request) => {
  return JSON.stringify(req.body, null, 2) // Log body
})

morgan.token('query', (req: Request) => {
  return JSON.stringify(req.query, null, 2) // Log query params
})

morgan.token('params', (req: Request) => {
  return JSON.stringify(req.params, null, 2) // Log route params
})

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
  // Use the http severity
  write: (message) => Logger.http(message)
}

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env.trim().toString() !== 'development'
}

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ':method :url :status :res[content-length] - :response-time ms\n' +
    'Body: :body\n' +
    'Query: :query\n' +
    'Params: :params',
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
)

export default morganMiddleware
