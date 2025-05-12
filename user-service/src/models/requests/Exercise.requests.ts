import {
  ExerciseCategories,
  ExerciseQueryTypeFilter,
  ExerciseType,
  ForceType,
  LevelType,
  MechanicsType
} from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'
import { Filter } from './Index.request'
import MuscleGroup from '../schemas/MuscleGroup.schema'

export interface ExerciseReqBody {
  name: string
  description: string
  category: ExerciseCategories
  calories_burn_per_minutes: number
  image: string
  video: string
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
export interface UpdateExerciseReqBody {
  name?: string
  description?: string
  category?: ExerciseCategories
  calories_burn_per_minutes?: number
  image?: string
  video?: string
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

export interface ExerciseReqQuery extends PaginationReqQuery, Filter {
  type: ExerciseQueryTypeFilter
}
