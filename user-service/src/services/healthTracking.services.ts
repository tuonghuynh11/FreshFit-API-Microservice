import { HealthTrackingBody, UpdateHealthTrackingBody } from '~/models/requests/HealthTracking.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import HealthTracking from '~/models/schemas/HealthTrackings.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { HEALTH_TRACKING_MESSAGES } from '~/constants/messages'

class HealthTrackingService {
  async add({ user_id, healthTracking }: { user_id: string; healthTracking: HealthTrackingBody }) {
    const { date, type, value, target } = healthTracking
    const isExist = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      date,
      type
    })

    if (!isExist) {
      const newHealthTracking = await databaseService.healthTrackings.insertOne(
        new HealthTracking({
          user_id: new ObjectId(user_id),
          date,
          type,
          value,
          target
        })
      )
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $push: {
            healthTrackings: newHealthTracking.insertedId
          }
        }
      )
    } else {
      await databaseService.healthTrackings.updateOne(
        {
          user_id: new ObjectId(user_id),
          date,
          type
        },
        {
          $set: {
            value,
            target
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    }
  }
  async update({
    user_id,
    id,
    updateHealthTracking
  }: {
    user_id: string
    updateHealthTracking: UpdateHealthTrackingBody
    id: string
  }) {
    const isExist = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(id)
    })

    if (!isExist) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.healthTrackings.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateHealthTracking
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result
  }

  async getById({ user_id, id }: { user_id: string; id: string }) {
    const healthTracking = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(id)
    })

    if (!healthTracking) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.healthTrackings
      .aggregate<HealthTracking[]>([
        {
          $match: {
            _id: new ObjectId(id),
            user_id: new ObjectId(user_id)
          }
        },
        {
          $unwind: {
            path: '$healthTrackingDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'exercises',
            let: { exerciseId: '$healthTrackingDetails.exerciseId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$exerciseId'] } } }],
            as: 'healthTrackingDetails.exercise'
          }
        },
        {
          $set: {
            'healthTrackingDetails.exercise': { $arrayElemAt: ['$healthTrackingDetails.exercise', 0] }
          }
        },
        {
          $lookup: {
            from: 'dishes',
            let: { dishId: '$healthTrackingDetails.dishId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$dishId'] } } }],
            as: 'healthTrackingDetails.dish'
          }
        },
        {
          $set: {
            'healthTrackingDetails.dish': { $arrayElemAt: ['$healthTrackingDetails.dish', 0] }
          }
        },
        {
          $lookup: {
            from: 'sets',
            let: { setId: '$healthTrackingDetails.setId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$setId'] } } }],
            as: 'healthTrackingDetails.set'
          }
        },
        {
          $set: {
            'healthTrackingDetails.set': { $arrayElemAt: ['$healthTrackingDetails.set', 0] }
          }
        },
        {
          $lookup: {
            from: 'meals',
            let: { mealId: '$healthTrackingDetails.mealId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$mealId'] } } }],
            as: 'healthTrackingDetails.meal'
          }
        },
        {
          $set: {
            'healthTrackingDetails.meal': { $arrayElemAt: ['$healthTrackingDetails.meal', 0] }
          }
        },
        {
          $group: {
            _id: '$_id',
            date: { $first: '$date' },
            type: { $first: '$type' },
            user_id: { $first: '$user_id' },
            value: { $first: '$value' },
            target: { $first: '$target' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            status: { $first: '$status' },
            healthTrackingDetails: { $push: '$healthTrackingDetails' }
          }
        }
      ])
      .toArray()

    return healthTracking ? result[0] : null
  }
}
const healthTrackingService = new HealthTrackingService()
export default healthTrackingService
