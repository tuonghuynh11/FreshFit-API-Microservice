import { ErrorWithStatus } from '~/models/Errors'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import {
  HealthTrackingDetailBody,
  HealthTrackingDetailForMealBody,
  UpdateHealthTrackingDetailBody
} from '~/models/requests/HealthTrackingDetail.requests'
import HealthTrackingDetail from '~/models/schemas/HealthTrackingDetails.schema'
import HealthTracking from '~/models/schemas/HealthTrackings.schema'
import { HEALTH_TRACKING_DETAIL_MESSAGES, HEALTH_TRACKING_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { GeneralStatus, HealthTrackingType } from '~/constants/enums'
import Meals from '~/models/schemas/Meals.schema'
import { isIds1ContainInId2 } from './user-challenge-participation.services'

class HealthTrackingDetailService {
  async add({ user_id, healthTrackingDetail }: { user_id: string; healthTrackingDetail: HealthTrackingDetailBody }) {
    const now = new Date()
    let formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    if (healthTrackingDetail.date) {
      formattedDate = healthTrackingDetail.date
    }
    console.log('formattedDate', formattedDate)

    const isExist = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      date: formattedDate,
      type: healthTrackingDetail.type
    })
    if (!isExist) {
      // throw new ErrorWithStatus({
      //   message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
      //   status: HTTP_STATUS.NOT_FOUND
      // })
      // Create a new health tracking if it doesn't exist
      const newHealthTrackingId = new ObjectId()
      const newHealthTrackingDetail = new HealthTrackingDetail({
        _id: new ObjectId(),
        health_tracking_id: newHealthTrackingId,
        ...healthTrackingDetail
      })
      const newHealthTracking = await databaseService.healthTrackings.insertOne(
        new HealthTracking({
          _id: newHealthTrackingId,
          user_id: new ObjectId(user_id),
          date: formattedDate,
          type: healthTrackingDetail.type,
          value: 0,
          target: 0,
          healthTrackingDetails: [newHealthTrackingDetail]
        })
      )

      await Promise.all([
        databaseService.users.updateOne(
          {
            _id: new ObjectId(user_id)
          },
          {
            $push: {
              healthTrackings: newHealthTracking.insertedId
            }
          }
        )
      ])
      return newHealthTrackingDetail
    } else {
      // const inserted = await databaseService.healthTrackingDetails.insertOne(
      //   new HealthTrackingDetail({
      //     health_tracking_id: isExist._id,
      //     ...healthTrackingDetail
      //   })
      // )
      // const newHealthTrackingDetail = await databaseService.healthTrackingDetails.findOne({
      //   _id: inserted.insertedId
      // })

      // if (!newHealthTrackingDetail) {
      //   throw new Error(USERS_MESSAGES.FAILED_TO_CREATE_HEALTH_TRACKING_DETAIL)
      // }

      const newHealthTrackingDetail = new HealthTrackingDetail({
        _id: new ObjectId(),
        health_tracking_id: isExist._id,
        ...healthTrackingDetail
      })
      await databaseService.healthTrackings.updateOne(
        {
          _id: isExist._id
        },
        {
          $push: {
            healthTrackingDetails: newHealthTrackingDetail
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      return newHealthTrackingDetail
    }
  }
  async addHealthTrackingDetailForMeal({
    user_id,
    healthTrackingDetail
  }: {
    user_id: string
    healthTrackingDetail: HealthTrackingDetailForMealBody
  }) {
    const now = new Date()
    let formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    if (healthTrackingDetail.date) {
      formattedDate = healthTrackingDetail.date
    }

    const [isExist, dishes] = await Promise.all([
      databaseService.healthTrackings.findOne({
        user_id: new ObjectId(user_id),
        date: formattedDate,
        type: HealthTrackingType.Calories_Consumed
      }),
      databaseService.dishes
        .find({
          _id: { $in: healthTrackingDetail.dishIds.map((id) => new ObjectId(id)) }
        })
        .toArray()
    ])

    const dishObjectIds = healthTrackingDetail.dishIds.map((id) => new ObjectId(id))

    if (!isExist) {
      // throw new ErrorWithStatus({
      //   message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
      //   status: HTTP_STATUS.NOT_FOUND
      // })

      // Create meal by the request

      const totalCalories = Number(dishes.reduce((acc, dish) => acc + Number(dish.calories), 0).toFixed(2))
      const totalPrepTime = Number(dishes.reduce((acc, dish) => acc + Number(dish.prep_time), 0).toFixed(2))
      const meal = new Meals({
        isPartOfHealthTrackingDetail: true,
        calories: totalCalories,
        date: formattedDate,
        meal_type: healthTrackingDetail.mealType,
        pre_time: totalPrepTime,
        description: '',
        dishes: healthTrackingDetail.dishIds
      })
      const mealInserted = await databaseService.meals.insertOne(meal)

      // Create a new health tracking if it doesn't exist
      const newHealthTrackingId = new ObjectId()
      const newHealthTrackingDetail = new HealthTrackingDetail({
        _id: new ObjectId(),
        health_tracking_id: newHealthTrackingId,
        mealId: mealInserted.insertedId.toString(),
        value: totalCalories
      })
      const newHealthTracking = await databaseService.healthTrackings.insertOne(
        new HealthTracking({
          _id: newHealthTrackingId,
          user_id: new ObjectId(user_id),
          date: formattedDate,
          type: HealthTrackingType.Calories_Consumed,
          value: 0,
          target: 0,
          healthTrackingDetails: [newHealthTrackingDetail]
        })
      )

      await Promise.all([
        databaseService.users.updateOne(
          {
            _id: new ObjectId(user_id)
          },
          {
            $push: {
              healthTrackings: newHealthTracking.insertedId
            }
          }
        )
      ])
      return newHealthTrackingDetail
    } else {
      const mealIds = isExist.healthTrackingDetails.map((detail) => detail.mealId!)
      const meal = await databaseService.meals.findOne({
        _id: { $in: mealIds },
        meal_type: healthTrackingDetail.mealType
      })

      if (meal) {
        const totalExtraCalories = Number(dishes.reduce((acc, dish) => acc + Number(dish.calories), 0).toFixed(2))
        const totalExtraPrepTime = Number(dishes.reduce((acc, dish) => acc + Number(dish.prep_time), 0).toFixed(2))
        await Promise.all([
          databaseService.meals.updateOne(
            {
              _id: meal._id
            },
            {
              $set: {
                dishes: [...meal.dishes, ...dishObjectIds],
                calories: Number((meal.calories + totalExtraCalories).toFixed(2)),
                pre_time: Number((meal.pre_time + totalExtraPrepTime).toFixed(2))
              },
              $currentDate: {
                updated_at: true
              }
            }
          ),
          databaseService.healthTrackings.updateOne(
            {
              _id: isExist._id,
              'healthTrackingDetails.mealId': meal._id
            },
            {
              $set: {
                'healthTrackingDetails.$.value': Number((meal.calories + totalExtraCalories).toFixed(2))
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
        ])
      } else {
        // Create meal by the request
        const totalCalories = Number(dishes.reduce((acc, dish) => acc + Number(dish.calories), 0).toFixed(2))
        const totalPrepTime = Number(dishes.reduce((acc, dish) => acc + Number(dish.prep_time), 0).toFixed(2))
        const meal = new Meals({
          isPartOfHealthTrackingDetail: true,
          calories: totalCalories,
          date: formattedDate,
          meal_type: healthTrackingDetail.mealType,
          pre_time: totalPrepTime,
          description: '',
          dishes: healthTrackingDetail.dishIds
        })
        const mealInserted = await databaseService.meals.insertOne(meal)

        const newHealthTrackingDetail = new HealthTrackingDetail({
          _id: new ObjectId(),
          health_tracking_id: isExist._id,
          mealId: mealInserted.insertedId.toString(),
          value: totalCalories
        })
        await databaseService.healthTrackings.updateOne(
          {
            _id: isExist._id
          },
          {
            $push: {
              healthTrackingDetails: newHealthTrackingDetail
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        return newHealthTrackingDetail
      }
    }
  }

  async update({
    user_id,
    id,
    healthTrackingId,
    updateHealthTrackingDetail
  }: {
    user_id: string
    id: string
    healthTrackingId: string
    updateHealthTrackingDetail: UpdateHealthTrackingDetailBody
  }) {
    const healthTracking = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(healthTrackingId)
    })

    // Check if the health tracking exists
    if (!healthTracking) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if the health tracking detail exists
    const healthTrackingDetailIndex = healthTracking.healthTrackingDetails.findIndex(
      (detail) => detail._id?.toString() === id
    )
    const healthTrackingDetail = healthTracking.healthTrackingDetails.find((detail) => detail._id?.toString() === id)

    if (healthTrackingDetailIndex === -1) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_DETAIL_MESSAGES.HEALTH_TRACKING_DETAIL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Update the document in the database
    const result = await databaseService.healthTrackings.findOneAndUpdate(
      {
        _id: new ObjectId(healthTrackingId),
        user_id: new ObjectId(user_id),
        'healthTrackingDetails._id': new ObjectId(id)
      },
      {
        $set: {
          'healthTrackingDetails.$': {
            ...healthTrackingDetail,
            ...updateHealthTrackingDetail,
            updated_at: new Date()
          }
        },
        $inc: {
          value:
            updateHealthTrackingDetail.status === GeneralStatus.Done
              ? healthTrackingDetail!.value!
              : -healthTrackingDetail!.value
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return result?.healthTrackingDetails[healthTrackingDetailIndex]
  }
  async delete({ user_id, id, healthTrackingId }: { user_id: string; id: string; healthTrackingId: string }) {
    const healthTracking = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(healthTrackingId)
    })

    // Check if the health tracking exists
    if (!healthTracking) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if the health tracking detail exists
    const healthTrackingDetailIndex = healthTracking.healthTrackingDetails.findIndex(
      (detail) => detail._id?.toString() === id
    )
    const healthTrackingDetail = healthTracking.healthTrackingDetails.find((detail) => detail._id?.toString() === id)

    if (healthTrackingDetailIndex === -1) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_DETAIL_MESSAGES.HEALTH_TRACKING_DETAIL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if the health tracking detail is Calories Consumed Type
    if (healthTracking.type === HealthTrackingType.Calories_Consumed) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_DETAIL_MESSAGES.CANNOT_DELETE_CONSUMED_TRACKING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Update the document in the database
    const result = await databaseService.healthTrackings.findOneAndUpdate(
      {
        _id: new ObjectId(healthTrackingId),
        user_id: new ObjectId(user_id)
      },
      {
        $pull: {
          healthTrackingDetails: {
            _id: new ObjectId(id)
          }
        },

        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return result
  }
  async deleteDishesInHealthTrackingDetailForMeal({
    user_id,
    healthTrackingId,
    id,
    dishIds
  }: {
    user_id: string
    healthTrackingId: string
    id: string
    dishIds: string[]
  }) {
    const healthTracking = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(healthTrackingId)
    })

    // Check if the health tracking exists
    if (!healthTracking) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if the health tracking detail exists
    const healthTrackingDetailIndex = healthTracking.healthTrackingDetails.findIndex(
      (detail) => detail._id?.toString() === id
    )
    const healthTrackingDetail = healthTracking.healthTrackingDetails.find((detail) => detail._id?.toString() === id)

    if (healthTrackingDetailIndex === -1) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_DETAIL_MESSAGES.HEALTH_TRACKING_DETAIL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // Get meal
    const meal = await databaseService.meals.findOne({
      _id: new ObjectId(healthTrackingDetail!.mealId!)
    })

    const isDishIdsInMeal = isIds1ContainInId2(
      dishIds.map((item) => new ObjectId(item)),
      meal!.dishes!
    )
    if (!isDishIdsInMeal) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_DETAIL_MESSAGES.DISHES_NOT_IN_MEAL,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    //get dishes
    const dishes = await databaseService.dishes
      .find({
        _id: { $in: dishIds.map((id) => new ObjectId(id)) }
      })
      .toArray()
    const totalCalories = Number(dishes.reduce((acc, dish) => acc + Number(dish.calories), 0).toFixed(2))
    const totalPrepTime = Number(dishes.reduce((acc, dish) => acc + Number(dish.prep_time), 0).toFixed(2))
    // Remove dishes from the meal
    await databaseService.meals.updateOne(
      {
        _id: new ObjectId(healthTrackingDetail!.mealId!)
      },
      [
        {
          $set: {
            dishes: {
              $filter: {
                input: '$dishes',
                as: 'dish',
                cond: { $not: { $in: ['$$dish', dishIds.map((id) => new ObjectId(id))] } }
              }
            },
            updated_at: new Date()
          }
        },
        {
          $set: {
            calories: { $subtract: ['$calories', totalCalories] },
            pre_time: { $subtract: ['$pre_time', totalPrepTime] }
          }
        }
      ]
    )

    // Update the document in the database
    const result = await databaseService.healthTrackings.findOneAndUpdate(
      {
        _id: new ObjectId(healthTrackingId),
        user_id: new ObjectId(user_id),
        'healthTrackingDetails._id': new ObjectId(id)
      },
      {
        $set: {
          'healthTrackingDetails.$.value': healthTrackingDetail!.value - totalCalories
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return result?.healthTrackingDetails[healthTrackingDetailIndex]
  }
}
const healthTrackingDetailService = new HealthTrackingDetailService()
export default healthTrackingDetailService
