import express from 'express'
import swaggerUi from 'swagger-ui-express'
import usersRouter from './users.routes'
import mediaRouter from './media.routes'
import path from 'path'
import YAML from 'yaml'
import fs from 'fs'
import mealsRouter from './meals.routes'
import exercisesRouter from './exercises.routes'
import setsRouter from './sets.routes'
import setsExerciseRouter from './set-exercsie.routes'
import workoutPlansRouter from './workout-plans.routes'
import workoutPlanDetailsRouter from './workout-plan-details.routes'
import challengesRouter from './challenges.routes'
import dishesRouter from './dishes.routes'
import ingredientsRouter from './ingredients.routes'
import reportsRouter from './reports.routes'
import chatsRouter from './chat.routes'
import statisticsRouter from './statistics.routes'
import fruitsRouter from './fruits.routes'
import recommendsRouter from './recommend.routes'
import transactionsRouter from './transactions.routes'
import clientRouter from './client.routes'
import postsRouter from './post.routes'
import bookmarksRouter from './bookmarks.routes'
import notificationsRouter from './notifications.routes'
import healthPlansRouter from './health-plan.routes'
import healthPlanDetailsRouter from './health-plan-details.routes'
import userChallengeParticipationRouter from './user-challenge-participation.routes'

const file = fs.readFileSync(path.resolve('slda-swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)
const versionOneRouter = express.Router()

versionOneRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
versionOneRouter.use('/users', usersRouter)
versionOneRouter.use('/medias', mediaRouter)
versionOneRouter.use('/meals', mealsRouter)
versionOneRouter.use('/exercises', exercisesRouter)
versionOneRouter.use('/sets', setsRouter)
versionOneRouter.use('/sets-exercise', setsExerciseRouter)
versionOneRouter.use('/workout-plans', workoutPlansRouter)
versionOneRouter.use('/workout-plan-details', workoutPlanDetailsRouter)
versionOneRouter.use('/challenges', challengesRouter)
versionOneRouter.use('/dishes', dishesRouter)
versionOneRouter.use('/ingredients', ingredientsRouter)
versionOneRouter.use('/reports', reportsRouter)
versionOneRouter.use('/chats', chatsRouter)
versionOneRouter.use('/statistics', statisticsRouter)
versionOneRouter.use('/fruits', fruitsRouter)
versionOneRouter.use('/recommends', recommendsRouter)
versionOneRouter.use('/transactions', transactionsRouter)
versionOneRouter.use('/clients', clientRouter)
versionOneRouter.use('/posts', postsRouter)
versionOneRouter.use('/bookmarks', bookmarksRouter)
versionOneRouter.use('/notifications', notificationsRouter)
versionOneRouter.use('/health-plans', healthPlansRouter)
versionOneRouter.use('/health-plan-details', healthPlanDetailsRouter)
versionOneRouter.use('/user-challenge-participation', userChallengeParticipationRouter)
export { versionOneRouter }
