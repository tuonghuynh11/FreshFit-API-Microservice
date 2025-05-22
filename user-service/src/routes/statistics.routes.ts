import { Router } from 'express'
import {
  getAgeStatisticForOverviewController,
  getNutritionStatisticController,
  getOverviewStatisticForAdminController,
  getStatisticAboutTopController,
  getStatisticForAdminDashboardController,
  getTopChallengesForOverviewStatisticController,
  getUserGrowthForOverviewStatisticController,
  getUserStatisticController,
  getWorkoutsStatisticController,
  getWorkoutWeeklyCompletionRateStatisticController
} from '~/controllers/statistics.controllers'
import {
  topStatisticValidator,
  weeklyCompletionRatesValidator,
  yearValidator
} from '~/middlewares/statistic.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /statistics
const statisticsRouter = Router()

/**
 * Description: Get top menu, workout_set and exercise
 * Path: /top?top = 10
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
/**
 * Description: Get statistic admin dashboard
 * Path: /admin/dashboard
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/dashboard',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getStatisticForAdminDashboardController)
)

// ------------------OVERVIEW STATISTIC-----------------
/**
 * Description: Get overview statistic for admin
 * Path: /admin/overview
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/overview',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getOverviewStatisticForAdminController)
)
/**
 * Description: Get User Growth for overview statistic
 * Path: /admin/overview/user-growth?year=2023
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/overview/user-growth',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  yearValidator,
  wrapRequestHandler(getUserGrowthForOverviewStatisticController)
)
/**
 * Description: Get Top 5 challenges for overview statistic
 * Path: /admin/overview/top-challenges?year=2023&top=5
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/overview/top-challenges',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  yearValidator,
  topStatisticValidator,
  wrapRequestHandler(getTopChallengesForOverviewStatisticController)
)
/**
 * Description: Get age statistic for overview statistic
 * Path: /admin/overview/age
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/overview/age',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getAgeStatisticForOverviewController)
)
// ------------------OVERVIEW STATISTIC-----------------

// ------------------USER STATISTIC-----------------

/**
 * Description: Get User Statistic For Admin
 * Path: /admin/users
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/users',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getUserStatisticController)
)

// ------------------USER STATISTIC-----------------

// ------------------WORKOUTS STATISTIC-----------------
/**
 * Description: Get Workouts Statistic For Admin
 * Path: /admin/workouts
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/workouts',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getWorkoutsStatisticController)
)
/**
 * Description: Get weekly workout completion rates For Admin
 * Path: /admin/workouts/weekly-completion-rates? year=2023 & month=8 & week=2
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/workouts/weekly-completion-rates',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  weeklyCompletionRatesValidator,
  wrapRequestHandler(getWorkoutWeeklyCompletionRateStatisticController)
)
// ------------------WORKOUTS STATISTIC-----------------

// ------------------NUTRITION STATISTIC-----------------
/**
 * Description: Get Nutrition Statistic For Admin
 * Path: /admin/nutrition
 * Method: Get
 * Body:
 * **/
statisticsRouter.get(
  '/admin/nutrition',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(getNutritionStatisticController)
)
// ------------------NUTRITION STATISTIC-----------------

export default statisticsRouter
