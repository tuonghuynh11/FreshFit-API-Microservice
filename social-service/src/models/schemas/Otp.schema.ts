import { ObjectId } from 'mongodb'

interface OTPType {
  _id?: ObjectId
  code: string
  expired_at: Date
  created_at?: Date
  updated_at?: Date
}

export default class OTP {
  _id?: ObjectId
  code: string
  expired_at: Date
  created_at?: Date
  updated_at?: Date

  constructor(otpType: OTPType) {
    const date = new Date()
    this._id = otpType._id
    this.code = otpType.code
    this.expired_at = otpType.expired_at
    this.created_at = otpType.created_at || date
    this.updated_at = otpType.updated_at || date
  }
}
