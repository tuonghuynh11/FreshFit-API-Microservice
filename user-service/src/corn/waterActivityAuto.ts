import { UserRole, UserVerifyStatus } from '~/constants/enums'
import { Water } from '~/models/schemas/Water.schema'
import databaseService from '~/services/database.services'
import { getNowDateWithoutTime } from '~/utils/commons'

export const waterActivityAuto = async () => {
  const { date, goal, step }: any = {
    date: getNowDateWithoutTime(),
    goal: 2000,
    step: 100
  }

  const users = await databaseService.users
    .find({
      role: UserRole.User,
      verify: UserVerifyStatus.Verified
    })
    .toArray()

  const waterInserted = await databaseService.waters.insertMany(
    users.map((user: any) => {
      return new Water({
        user_id: user._id,
        date,
        goal,
        step,
        progress: step
      })
    })
  )
  await Promise.all(
    users.map((user: any, index: number) => {
      return databaseService.users.updateOne(
        {
          _id: user._id
        },
        {
          $push: {
            waters: waterInserted.insertedIds[index]
          }
        }
      )
    })
  )
  console.log('water inserted')
}
