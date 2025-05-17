import { HealthTrackingType, UserRole, UserVerifyStatus } from '~/constants/enums'
import HealthTracking from '~/models/schemas/HealthTrackings.schema'
import databaseService from '~/services/database.services'
import { getNowDateWithoutTime } from '~/utils/commons'

export const healthTrackingAuto = async () => {
  const { date, value, target }: any = {
    date: getNowDateWithoutTime(),
    value: 0,
    target: 0
  }

  const [usersNoHaveBurnedTracking, usersNoHaveConsumedTracking] = await Promise.all([
    databaseService.users
      .aggregate([
        {
          $match: {
            role: UserRole.User,
            verify: UserVerifyStatus.Verified
          }
        },
        {
          $lookup: {
            from: 'health_trackings',
            localField: 'healthTrackings',
            foreignField: '_id',
            as: 'healthTrackingDocs'
          }
        },
        {
          $match: {
            healthTrackingDocs: {
              $not: {
                $elemMatch: {
                  date: date,
                  type: HealthTrackingType.Calories_Burned
                }
              }
            }
          }
        }
      ])
      .toArray(),
    databaseService.users
      .aggregate([
        {
          $match: {
            role: UserRole.User,
            verify: UserVerifyStatus.Verified
          }
        },
        {
          $lookup: {
            from: 'health_trackings',
            localField: 'healthTrackings',
            foreignField: '_id',
            as: 'healthTrackingDocs'
          }
        },
        {
          $match: {
            healthTrackingDocs: {
              $not: {
                $elemMatch: {
                  date: date,
                  type: HealthTrackingType.Calories_Consumed
                }
              }
            }
          }
        }
      ])
      .toArray()
  ])

  const [healthTrackingBurnedInserted, healthTrackingConsumedInserted] = await Promise.all([
    databaseService.healthTrackings.insertMany(
      usersNoHaveBurnedTracking.map((user: any) => {
        return new HealthTracking({
          user_id: user._id,
          date,
          type: HealthTrackingType.Calories_Burned,
          value,
          target
        })
      })
    ),
    databaseService.healthTrackings.insertMany(
      usersNoHaveConsumedTracking.map((user: any) => {
        return new HealthTracking({
          user_id: user._id,
          date,
          type: HealthTrackingType.Calories_Consumed,
          value,
          target
        })
      })
    )
  ])
  await Promise.all([
    ...usersNoHaveBurnedTracking.map((user: any, index: number) => {
      return databaseService.users.updateOne(
        {
          _id: user._id
        },
        {
          $push: {
            healthTrackings: {
              $each: [healthTrackingBurnedInserted.insertedIds[index]]
            }
          }
        }
      )
    }),
    ...usersNoHaveConsumedTracking.map((user: any, index: number) => {
      return databaseService.users.updateOne(
        {
          _id: user._id
        },
        {
          $push: {
            healthTrackings: {
              $each: [healthTrackingConsumedInserted.insertedIds[index]]
            }
          }
        }
      )
    })
  ])
  console.log('health tracking inserted')
}

/// ---- First Version ---- ///
// export const healthTrackingAuto = async () => {
// }
