import { HealthTarget } from '~/constants/enums'

export interface GenerateHealthPlanBody {
  target: HealthTarget
  percentDietaryDeficit: number // Tỷ lệ thâm hụt calo từ chế độ ăn uống - chiếm bao nhiêu phần trăm trong tổng số calo cần thiết
  percentWorkoutDeficit: number // Tỷ lệ thâm hụt calo từ tập luyện - chiếm bao nhiêu phần trăm trong tổng số calo cần thiết
}
