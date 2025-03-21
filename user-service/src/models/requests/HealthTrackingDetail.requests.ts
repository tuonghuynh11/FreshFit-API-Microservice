import { HealthTrackingType } from '~/constants/enums'
import Exercises from '../schemas/Exercises.schema'
import Meals from '../schemas/Meals.schema'

export interface HealthTrackingDetailBody {
  type: HealthTrackingType
  exercise?: Exercises
  meal?: Meals
  value: number
}
