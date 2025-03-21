import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { HEALTH_TRACKING_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { HealthTrackingDetailBody } from '~/models/requests/HealthTrackingDetail.requests'
import HealthTrackingDetail from '~/models/schemas/HealthTrackingDetails.schema'

class HealthTrackingDetailService {
  async add({ user_id, healthTrackingDetail }: { user_id: string; healthTrackingDetail: HealthTrackingDetailBody }) {
    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const isExist = await databaseService.healthTrackings.findOne({
      user_id: new ObjectId(user_id),
      date: formattedDate,
      type: healthTrackingDetail.type
    })
    if (!isExist) {
      throw new ErrorWithStatus({
        message: HEALTH_TRACKING_MESSAGES.HEALTH_TRACKING_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (isExist) {
      const inserted = await databaseService.healthTrackingDetails.insertOne(
        new HealthTrackingDetail({
          health_tracking_id: isExist._id,
          ...healthTrackingDetail
        })
      )
      const newHealthTrackingDetail = await databaseService.healthTrackingDetails.findOne({
        _id: inserted.insertedId
      })

      if (!newHealthTrackingDetail) {
        throw new Error(USERS_MESSAGES.FAILED_TO_CREATE_HEALTH_TRACKING_DETAIL)
      }

      await databaseService.healthTrackings.updateOne(
        {
          _id: isExist._id
        },
        {
          $inc: {
            value: healthTrackingDetail.value
          },
          $push: {
            healthTrackingDetails: newHealthTrackingDetail
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    }
  }
}
const healthTrackingDetailService = new HealthTrackingDetailService()
export default healthTrackingDetailService
