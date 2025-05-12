import { ObjectId } from 'mongodb'
import { SetStatus, SetType } from '~/constants/enums'
import SetExercises from './SetExercises.schema'

interface ISet {
  _id?: ObjectId
  name: string
  type: SetType
  description?: string
  user_id?: ObjectId
  number_of_exercises: number
  status?: SetStatus
  rating?: number
  created_at?: Date
  updated_at?: Date
  set_exercises: SetExercises[]
  time?: string // 2 hour, 30 minutes
  image?: string
  total_calories?: number
  is_youtube_workout?: boolean // true nếu là youtube workout, false nếu là set bài tập bình thường
  youtube_id?: string // id của video youtube, dùng để lấy thông tin video từ youtube api
}

export default class Sets {
  _id?: ObjectId
  name: string
  type: SetType
  description?: string
  user_id?: ObjectId
  number_of_exercises: number
  status?: SetStatus
  rating?: number
  created_at?: Date
  updated_at?: Date
  set_exercises: SetExercises[]
  time?: string
  image?: string
  total_calories?: number
  is_youtube_workout?: boolean // true nếu là youtube workout, false nếu là set bài tập bình thường
  youtube_id?: string // id của video youtube, dùng để lấy thông tin video từ youtube api

  constructor(set: ISet) {
    const date = new Date()
    this._id = set._id
    this.name = set.name
    this.type = set.type
    this.description = set.description
    this.user_id = set.user_id
    this.number_of_exercises = set.number_of_exercises
    this.status = set.status || SetStatus.Undone
    this.rating = set.rating || 0
    this.created_at = set.created_at || date
    this.updated_at = set.updated_at || date
    this.set_exercises = set.set_exercises || []
    this.time = set.time || ''
    this.image = set.image || 'https://res.cloudinary.com/dfo5tfret/image/upload/v1746290093/default-set-image.jpg'
    this.total_calories = set.total_calories || 0
    this.is_youtube_workout = false // mặc định là false, nếu là youtube workout thì sẽ được cập nhật sau
    this.youtube_id = set.youtube_id || ''
  }
}
