import { ObjectId } from 'mongodb'
import { ReportStatus } from '~/constants/enums'

interface ReportType {
  _id?: ObjectId
  from: ObjectId
  title: string
  message: string
  image?: string
  status?: ReportStatus
  created_at?: Date
  updated_at?: Date
}

export default class Reports {
  _id?: ObjectId
  from: ObjectId
  title: string
  message: string
  image?: string
  status: ReportStatus
  created_at?: Date
  updated_at?: Date

  constructor(reportType: ReportType) {
    const date = new Date()
    this._id = reportType._id
    this.from = reportType.from
    this.title = reportType.title
    this.message = reportType.message
    this.image = reportType.image || undefined
    this.status = reportType.status || ReportStatus.Unread
    this.created_at = reportType.created_at || date
    this.updated_at = reportType.updated_at || date
  }
}
