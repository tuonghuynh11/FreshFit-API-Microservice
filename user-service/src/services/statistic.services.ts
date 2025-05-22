import { omit } from 'lodash'
import databaseService from './database.services'
import {
  ChallengeStatus,
  GeneralStatus,
  HealthTrackingType,
  PostStatus,
  UserChallengeParticipationStatus,
  UserRole,
  UserVerifyStatus
} from '~/constants/enums'
class StatisticService {
  async getTop({ top = 1 }: { top?: number }) {
    const [exercises, dishes, sets] = await Promise.all([
      databaseService.exercises
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: top
          }
        )
        .toArray(),
      databaseService.dishes
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: top
          }
        )
        .toArray(),
      databaseService.sets
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: top
          }
        )
        .toArray()
    ])

    return {
      exercises,
      dishes,
      sets
    }
  }
  async getStatisticForAdminDashboard() {
    const startOfLastMonth = new Date()
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    startOfLastMonth.setDate(1)
    startOfLastMonth.setHours(0, 0, 0, 0)

    const endOfLastMonth = new Date()
    endOfLastMonth.setMonth(endOfLastMonth.getMonth(), 0)
    endOfLastMonth.setHours(23, 59, 59, 999)

    const startOfThisMonth = new Date()
    startOfThisMonth.setDate(1)
    startOfThisMonth.setHours(0, 0, 0, 0)

    const endOfThisMonth = new Date()
    endOfThisMonth.setMonth(endOfThisMonth.getMonth() + 1, 0)
    endOfThisMonth.setHours(23, 59, 59, 999)

    const top = 5

    const [
      total_active_users_last_month,
      total_active_users_current_month,
      total_active_challenges_last_month,
      total_active_challenges_current_month,
      top_5_exercises,
      top_5_dishes,
      top_5_sets,
      top_5_contributors
    ] = await Promise.all([
      databaseService.users.countDocuments({
        created_at: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        },
        role: UserRole.User,
        verify: UserVerifyStatus.Verified
      }),
      databaseService.users.countDocuments({
        created_at: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth
        },
        role: UserRole.User,
        verify: UserVerifyStatus.Verified
      }),
      databaseService.challenges.countDocuments({
        created_at: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        },
        status: ChallengeStatus.Active
      }),
      databaseService.challenges.countDocuments({
        created_at: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth
        },
        status: ChallengeStatus.Active
      }),
      databaseService.exercises
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: top
          }
        )
        .toArray(),
      databaseService.dishes
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: top
          }
        )
        .toArray(),
      databaseService.sets
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: top
          }
        )
        .toArray(),
      databaseService.posts
        .aggregate([
          {
            $match: {
              status: PostStatus.Published
            }
          },
          {
            $group: {
              _id: '$user_id',
              totalPosts: { $sum: 1 }
            }
          },
          {
            $sort: {
              totalPosts: -1
            }
          },
          {
            $limit: top
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $match: {
              'user.verify': UserVerifyStatus.Verified
            }
          },
          {
            $project: {
              _id: 0,
              user_id: '$_id',
              totalPosts: 1,
              user_username: '$user.username',
              user_fullname: '$user.fullName',
              user_email: '$user.email',
              user_phoneNumber: '$user.phoneNumber',
              user_avatar: '$user.avatar'
            }
          }
        ])
        .toArray()
    ])

    return {
      total_active_users_last_month,
      total_active_users_current_month,
      total_active_challenges_last_month,
      total_active_challenges_current_month,
      top_5_exercises,
      top_5_dishes,
      top_5_sets,
      top_5_contributors
    }
  }

  async getOverviewStatisticForAdmin() {
    const startOfLastMonth = new Date()
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    startOfLastMonth.setDate(1)
    startOfLastMonth.setHours(0, 0, 0, 0)

    const endOfLastMonth = new Date()
    endOfLastMonth.setMonth(endOfLastMonth.getMonth(), 0)
    endOfLastMonth.setHours(23, 59, 59, 999)

    const startOfThisMonth = new Date()
    startOfThisMonth.setDate(1)
    startOfThisMonth.setHours(0, 0, 0, 0)

    const endOfThisMonth = new Date()
    endOfThisMonth.setMonth(endOfThisMonth.getMonth() + 1, 0)
    endOfThisMonth.setHours(23, 59, 59, 999)
    const [
      total_users_last_month,
      total_users_current_month,
      total_active_challenges_last_month,
      total_active_challenges_current_month
    ] = await Promise.all([
      databaseService.users.countDocuments({
        created_at: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        }
      }),
      databaseService.users.countDocuments({
        created_at: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth
        }
      }),
      databaseService.challenges.countDocuments({
        created_at: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth
        },
        status: ChallengeStatus.Active
      }),
      databaseService.challenges.countDocuments({
        created_at: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth
        },
        status: ChallengeStatus.Active
      })
    ])
    return {
      total_users_last_month,
      total_users_current_month,
      total_active_challenges_last_month,
      total_active_challenges_current_month
    }
  }
  async getUserGrowthForOverviewStatistic({ year }: { year: number }) {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year + 1, 0, 1)

    const monthlyNewUsers = await databaseService.users
      .aggregate([
        {
          $match: {
            created_at: {
              $gte: startOfYear,
              $lt: endOfYear
            }
          }
        },
        {
          $group: {
            _id: { month: { $month: '$created_at' } },
            newUsers: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.month': 1 }
        }
      ])
      .toArray()

    // Chuẩn bị kết quả 12 tháng
    const result = []
    let cumulativeTotal = await databaseService.users.countDocuments({
      created_at: { $lt: startOfYear }
    })

    for (let month = 1; month <= 12; month++) {
      const monthData = monthlyNewUsers.find((m) => m._id.month === month)
      const newUsers = monthData ? monthData.newUsers : 0
      cumulativeTotal += newUsers

      result.push({
        month,
        newUsers,
        totalUsers: cumulativeTotal
      })
    }

    return result
  }

  async getTopChallengesForOverviewStatistic({ year, top = 5 }: { year: number; top?: number }) {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year + 1, 0, 1)

    const challenges = await databaseService.challenges
      .aggregate([
        {
          $match: {
            created_at: {
              $gte: startOfYear,
              $lt: endOfYear
            },
            status: {
              $in: [ChallengeStatus.Active, ChallengeStatus.Expired]
            }
          }
        },
        {
          $lookup: {
            from: 'user_challenge_participation',
            localField: '_id',
            foreignField: 'challenge_id',
            as: 'participations'
          }
        },
        {
          $addFields: {
            total_participation: { $size: '$participations' },
            total_completed_participation: {
              $size: {
                $filter: {
                  input: '$participations',
                  as: 'p',
                  cond: { $eq: ['$$p.status', UserChallengeParticipationStatus.Completed] } // 👈 thay đúng enum nếu là string/số
                }
              }
            }
          }
        },
        {
          $sort: {
            total_participation: -1
          }
        },
        {
          $limit: top
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            type: 1,
            image: 1,
            start_date: 1,
            end_date: 1,
            status: 1,
            total_participation: 1,
            total_completed_participation: 1
          }
        },
        {
          $project: {
            participations: 0 // ẩn mảng gốc nếu không cần
          }
        }
      ])
      .toArray()

    return challenges
  }
  async getAgeStatisticForOverview() {
    const ageGroups = await databaseService.users
      .aggregate([
        {
          $addFields: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), '$date_of_birth'] },
                  1000 * 60 * 60 * 24 * 365.25 // milliseconds to years
                ]
              }
            }
          }
        },
        {
          $project: {
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $and: [{ $gte: ['$age', 18] }, { $lte: ['$age', 24] }] }, then: '18-24' },
                  { case: { $and: [{ $gte: ['$age', 25] }, { $lte: ['$age', 34] }] }, then: '25-34' },
                  { case: { $and: [{ $gte: ['$age', 35] }, { $lte: ['$age', 44] }] }, then: '35-44' },
                  { case: { $and: [{ $gte: ['$age', 45] }, { $lte: ['$age', 54] }] }, then: '45-54' },
                  { case: { $gte: ['$age', 55] }, then: '55+' }
                ],
                default: 'Under 18'
              }
            }
          }
        },
        {
          $group: {
            _id: '$ageGroup',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 } // Optional: sort by age group label
        }
      ])
      .toArray()
    // ✨ Merge với danh sách đầy đủ
    const fullGroups = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+']
    const ageStatsMap = Object.fromEntries(ageGroups.map((item) => [item._id, item.count]))

    const result = fullGroups.map((group) => ({
      _id: group,
      count: ageStatsMap[group] || 0
    }))
    return result
  }
  async getUserStatistic() {
    const [userLevels, userIntensityLevels, top_5_active_users] = await Promise.all([
      databaseService.users
        .aggregate([
          {
            $match: {
              role: UserRole.User
            }
          },
          {
            $group: {
              _id: '$level',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Optional: sort by level
          }
        ])
        .toArray(),
      databaseService.users
        .aggregate([
          {
            $match: {
              role: UserRole.User
            }
          },
          {
            $group: {
              _id: '$activityLevel',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Optional: sort by activityLevel
          }
        ])
        .toArray(),
      databaseService.healthTrackings
        .aggregate([
          // Lọc các bản ghi loại 'Workout' (nếu cần)
          {
            $match: {
              type: HealthTrackingType.Calories_Burned
            }
          },
          // Tách mảng healthTrackingDetails
          {
            $unwind: '$healthTrackingDetails'
          },
          // Chỉ lấy các item có setId và đã hoàn thành
          {
            $match: {
              'healthTrackingDetails.setId': { $ne: null },
              'healthTrackingDetails.status': GeneralStatus.Done // hoàn thành
            }
          },
          // Group theo user_id
          {
            $group: {
              _id: '$user_id',
              totalCompletedSets: { $sum: 1 }
            }
          },
          // Sắp xếp giảm dần
          {
            $sort: {
              totalCompletedSets: -1
            }
          },
          {
            $limit: 5
          },
          // (Optional) Join với bảng users để lấy thêm thông tin
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $project: {
              _id: 0,
              user_id: '$_id',
              totalCompletedSets: 1,
              username: '$user.username',
              fullName: '$user.fullName',
              email: '$user.email',
              avatar: '$user.avatar'
            }
          }
        ])
        .toArray()
    ])

    // ✨ Merge với danh sách đầy đủ
    const fullLevels = ['Beginner', 'Intermediate', 'Advanced']
    const userLevelsMap = Object.fromEntries(userLevels.map((item) => [item._id, item.count]))

    const user_level_statistic = fullLevels.map((level) => ({
      _id: level,
      count: userLevelsMap[level] || 0
    }))

    // ✨ Merge với danh sách đầy đủ
    const fullIntensityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active']
    const userIntensityLevelsMap = Object.fromEntries(userIntensityLevels.map((item) => [item._id, item.count]))

    const user_intensity_level_statistic = fullIntensityLevels.map((level) => {
      let formattedLevel = ''
      switch (level) {
        case 'sedentary':
          formattedLevel = 'Sedentary'
          break
        case 'light':
          formattedLevel = 'Light'
          break
        case 'moderate':
          formattedLevel = 'Moderate'
          break
        case 'active':
          formattedLevel = 'Active'
          break
        case 'very_active':
          formattedLevel = 'Very Active'
          break
        default:
          formattedLevel = level
      }
      return {
        _id: formattedLevel,
        count: userIntensityLevelsMap[level] || 0
      }
    })

    return {
      user_level_statistic,
      user_intensity_level_statistic,
      top_5_active_users
    }
  }
  async getWorkoutsStatistic() {
    const [setTypes, exerciseTypes, top_5_most_used_sets, top_5_highest_rating_exercises] = await Promise.all([
      databaseService.sets
        .aggregate([
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Optional: sort by level
          }
        ])
        .toArray(),
      databaseService.exercises
        .aggregate([
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Optional: sort by level
          }
        ])
        .toArray(),
      databaseService.healthTrackings
        .aggregate([
          // Lọc các bản ghi loại 'Workout' (nếu cần)
          {
            $match: {
              type: HealthTrackingType.Calories_Burned
            }
          },
          // Tách mảng healthTrackingDetails
          {
            $unwind: '$healthTrackingDetails'
          },
          // Chỉ lấy các item có setId và đã hoàn thành
          {
            $match: {
              'healthTrackingDetails.setId': { $ne: null },
              'healthTrackingDetails.status': GeneralStatus.Done // hoàn thành
            }
          },
          // Group theo set_id
          {
            $group: {
              _id: '$healthTrackingDetails.setId',
              totalCompletedSets: { $sum: 1 }
            }
          },
          // Sắp xếp giảm dần
          {
            $sort: {
              totalCompletedSets: -1
            }
          },
          {
            $limit: 5
          },
          // (Optional) Join với bảng sets để lấy thêm thông tin
          {
            $lookup: {
              from: 'sets',
              localField: '_id',
              foreignField: '_id',
              as: 'set'
            }
          },
          {
            $unwind: '$set'
          },
          {
            $project: {
              _id: 0,
              set_id: '$_id',
              name: '$set.name',
              description: '$set.description',
              type: '$set.type',
              image: '$set.image',
              rating: '$set.rating',
              totalCompletedSets: 1
            }
          }
        ])
        .toArray(),
      databaseService.exercises
        .aggregate([
          {
            $sort: {
              rating: -1
            }
          },
          {
            $limit: 5
          },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              type: 1,
              image: 1,
              rating: 1
            }
          }
        ])
        .toArray()
    ])

    // ✨ Merge với danh sách đầy đủ
    const fullSetLevels = ['Beginner', 'Intermediate', 'Advanced']
    const setLevelsMap = Object.fromEntries(setTypes.map((item) => [item._id, item.count]))

    const set_level_statistic = fullSetLevels.map((level) => ({
      _id: level,
      count: setLevelsMap[level] || 0
    }))
    // ✨ Merge với danh sách đầy đủ
    const fullExerciseTypes = [
      'Activation',
      'Conditioning',
      'Olympic Lifting',
      'Plyometrics',
      'Powerlifting',
      'SMR',
      'Strength',
      'Stretching',
      'Strongman',
      'Warmup'
    ]
    const exerciseTypesMap = Object.fromEntries(exerciseTypes.map((item) => [item._id, item.count]))

    const exercise_type_statistic = fullExerciseTypes.map((level) => ({
      _id: level,
      count: exerciseTypesMap[level] || 0
    }))

    return {
      set_level_statistic,
      exercise_type_statistic,
      top_5_most_used_sets,
      top_5_highest_rating_exercises
    }
  }
  async getWorkoutWeeklyCompletionRateStatistic({ year, month, week }: { year: number; month: number; week: number }) {
    const formatDate = (d: Date) => d.toISOString().slice(0, 10) // "YYYY-MM-DD"

    const startOfWeek = new Date(year, month - 1, (week - 1) * 7 + 1)
    const endOfWeek = new Date(year, month - 1, (week - 1) * 7 + 8)
    const startDateStr = formatDate(startOfWeek)
    const endDateStr = formatDate(new Date(endOfWeek.getTime() - 1)) // Trừ 1ms để bao hết ngày cuối

    const stats = await databaseService.healthTrackings
      .aggregate([
        {
          $match: {
            date: {
              $gte: startDateStr,
              $lte: endDateStr
            },
            type: HealthTrackingType.Calories_Burned
          }
        },
        {
          $project: {
            dayOfWeek: {
              $add: [
                {
                  $dayOfWeek: {
                    $dateFromString: {
                      dateString: '$date'
                    }
                  }
                },
                -1 // MongoDB: Sunday = 1 → muốn Monday = 1, Sunday = 7
              ]
            },
            status: 1
          }
        },
        {
          $group: {
            _id: '$dayOfWeek',
            totalWorkouts: { $sum: 1 },
            completedWorkouts: {
              $sum: {
                $cond: [{ $eq: ['$status', GeneralStatus.Done] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            dayOfWeek: '$_id',
            totalWorkouts: 1,
            completedWorkouts: 1,
            completionRate: {
              $cond: [
                { $eq: ['$totalWorkouts', 0] },
                0,
                {
                  $round: [
                    {
                      $multiply: [{ $divide: ['$completedWorkouts', '$totalWorkouts'] }, 100]
                    },
                    2
                  ]
                }
              ]
            },
            dayName: {
              $arrayElemAt: [
                ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                { $mod: ['$_id', 7] }
              ]
            }
          }
        },
        {
          $sort: { dayOfWeek: 1 }
        }
      ])
      .toArray()
    // Bổ sung các ngày không có dữ liệu
    const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const statsMap = Object.fromEntries(stats.map((item) => [item.dayOfWeek, item]))
    const fullStats = allDays.map((day, index) => {
      const stat = statsMap[index] || {
        dayOfWeek: index,
        totalWorkouts: 0,
        completedWorkouts: 0,
        completionRate: 0
      }
      return {
        ...omit(stat, ['_id']),
        dayName: day
      }
    })

    return fullStats
  }
  async getNutritionStatistic() {
    //Number of dishes by calories
    const [
      dishes_by_calories,
      dishes_with_all_nutrients,
      totalDishes,
      top_5_highest_rating_dishes,
      top_5_most_used_dishes
    ] = await Promise.all([
      databaseService.dishes
        .aggregate([
          {
            $group: {
              _id: {
                $cond: [
                  { $lt: ['$calories', 200] },
                  '0-200',
                  {
                    $cond: [
                      { $lt: ['$calories', 400] },
                      '200-400',
                      {
                        $cond: [
                          { $lt: ['$calories', 600] },
                          '400-600',
                          {
                            $cond: [
                              { $lt: ['$calories', 800] },
                              '600-800',
                              {
                                $cond: [{ $lt: ['$calories', 1000] }, '800-1000', '1000+']
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Optional: sort by level
          }
        ])
        .toArray()

        // Rename the _id field to calories_range
        .then((result) =>
          result.map((item) => ({
            calories_range: item._id,
            count: item.count
          }))
        ),
      databaseService.dishes.countDocuments({
        $and: [{ fat: { $gt: 0 } }, { protein: { $gt: 0 } }, { carbs: { $gt: 0 } }]
      }),
      await databaseService.dishes.countDocuments({}),
      databaseService.dishes
        .find(
          {},
          {
            sort: {
              rating: -1
            },
            limit: 5
          }
        )
        .toArray(),
      databaseService.meals
        .aggregate([
          {
            $lookup: {
              from: 'dishes',
              localField: 'dishes',
              foreignField: '_id',
              as: 'dish'
            }
          },
          {
            $unwind: '$dish'
          },
          {
            $group: {
              _id: '$dish._id',
              totalMeals: { $sum: 1 }
            }
          },
          {
            $sort: { totalMeals: -1 }
          },
          {
            $limit: 5
          },
          {
            $lookup: {
              from: 'dishes',
              localField: '_id',
              foreignField: '_id',
              as: 'dish'
            }
          },
          {
            $unwind: '$dish'
          },
          {
            $project: {
              _id: 0,
              dish_id: '$_id',
              name: '$dish.name',
              description: '$dish.description',
              type: '$dish.type',
              image: '$dish.image',
              rating: '$dish.rating',
              totalMeals: 1
            }
          }
        ])
        .toArray()
    ])

    // ✨ Merge với danh sách đầy đủ
    const fullCaloriesRanges = ['0-200', '200-400', '400-600', '600-800', '800-1000', '1000+']
    const dishesByCaloriesMap = Object.fromEntries(dishes_by_calories.map((item) => [item.calories_range, item.count]))
    const formatted_dishes_by_calories = fullCaloriesRanges.map((range) => ({
      calories_range: range,
      count: dishesByCaloriesMap[range] || 0
    }))

    // top_5_most_used_dishes

    return {
      dishes_by_calories: formatted_dishes_by_calories,
      dishes_with_all_nutrients: {
        count: dishes_with_all_nutrients,
        totalDishes,
        percentage: totalDishes > 0 ? ((dishes_with_all_nutrients / totalDishes) * 100).toFixed(2) : 0
      },
      top_5_highest_rating_dishes,
      top_5_most_used_dishes
    }
  }
}
const statisticService = new StatisticService()
export default statisticService
