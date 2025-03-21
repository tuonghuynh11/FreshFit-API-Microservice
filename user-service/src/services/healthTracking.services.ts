import { HealthTrackingBody } from '~/models/requests/HealthTracking.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import HealthTracking from '~/models/schemas/HealthTrackings.schema'

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
}
const healthTrackingService = new HealthTrackingService()
export default healthTrackingService
