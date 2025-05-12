import { ObjectId } from 'mongodb'
import { ExerciseCategories, ExerciseType, ForceType, LevelType, MechanicsType } from '~/constants/enums'
import MuscleGroup from './MuscleGroup.schema'

interface ExercisesType {
  _id?: ObjectId
  name: string
  description: string // overview
  category: ExerciseCategories
  calories_burn_per_minutes: number
  rating?: number
  image: string
  video: string
  created_at?: Date
  updated_at?: Date
  target_muscle?: MuscleGroup // nhóm cơ mà bài tập này tác động đến
  type?: ExerciseType
  equipment?: string // thiết bị cần thiết để thực hiện bài tập này
  mechanics?: MechanicsType
  forceType?: ForceType // loại lực tác động lên cơ bắp trong bài tập này
  experience_level?: LevelType // trình độ người tập cần có để thực hiện bài tập này
  secondary_muscle?: MuscleGroup // nhóm cơ phụ mà bài tập này tác động đến
  instructions?: string // hướng dẫn thực hiện bài tập này
  tips?: string // mẹo thực hiện bài tập này
}

export default class Exercises {
  _id?: ObjectId
  name: string
  description: string
  category: ExerciseCategories
  calories_burn_per_minutes: number
  rating?: number
  image: string
  video: string
  created_at?: Date
  updated_at?: Date
  target_muscle?: MuscleGroup // nhóm cơ mà bài tập này tác động đến
  type?: ExerciseType
  equipment?: string // thiết bị cần thiết để thực hiện bài tập này
  mechanics?: MechanicsType
  forceType?: ForceType // loại lực tác động lên cơ bắp trong bài tập này
  experience_level?: LevelType // trình độ người tập cần có để thực hiện bài tập này
  secondary_muscle?: MuscleGroup // nhóm cơ phụ mà bài tập này tác động đến
  instructions?: string // hướng dẫn thực hiện bài tập này
  tips?: string // mẹo thực hiện bài tập này

  constructor(exercise: ExercisesType) {
    const date = new Date()
    this._id = exercise._id
    this.name = exercise.name
    this.description = exercise.description
    this.category = exercise.category
    this.calories_burn_per_minutes = exercise.calories_burn_per_minutes
    this.image = exercise.image
    this.video = exercise.video
    this.created_at = exercise.created_at || date
    this.updated_at = exercise.updated_at || date
    this.rating = exercise.rating || 0
    this.target_muscle = exercise.target_muscle || ({} as MuscleGroup)
    this.type = exercise.type || ({} as ExerciseType)
    this.equipment = exercise.equipment || ''
    this.mechanics = exercise.mechanics || ({} as MechanicsType)
    this.forceType = exercise.forceType || ({} as ForceType)
    this.experience_level = exercise.experience_level || ({} as LevelType)
    this.secondary_muscle = exercise.secondary_muscle || ({} as MuscleGroup)
    this.instructions = exercise.instructions || ''
    this.tips = exercise.tips || ''
  }
}
