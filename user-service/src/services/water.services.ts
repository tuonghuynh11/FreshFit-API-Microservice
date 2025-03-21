import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { Water } from '~/models/schemas/Water.schema'
import { WaterBody } from '~/models/requests/Water.requests'

class WaterService {
  async add({ user_id, water }: { user_id: string; water: WaterBody }) {
    const { date, goal, step } = water
    const isExist = await databaseService.waters.findOne({
      user_id: new ObjectId(user_id),
      date
    })

    if (isExist) {
      return await databaseService.waters.updateOne(
        {
          user_id: new ObjectId(user_id),
          date
        },
        {
          $set: {
            goal,
            step,
            progress: isExist.progress + step
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    }
    const waterInserted = await databaseService.waters.insertOne(
      new Water({
        user_id: new ObjectId(user_id),
        date,
        goal,
        step,
        progress: step
      })
    )
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $push: {
          waters: waterInserted.insertedId
        }
      }
    )
    return waterInserted
  }
}
const waterService = new WaterService()
export default waterService
