import { HealthTrackingType } from '~/constants/enums'

export interface HealthTrackingBody {
  date: string
  type: HealthTrackingType
  value: number
  target: number
}
