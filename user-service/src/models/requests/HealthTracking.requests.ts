import { GeneralStatus, HealthTrackingType } from '~/constants/enums'

export interface HealthTrackingBody {
  date: string
  type: HealthTrackingType
  value: number
  target: number
}
export interface UpdateHealthTrackingBody {
  value?: number
  target?: number
  status?: GeneralStatus
}
