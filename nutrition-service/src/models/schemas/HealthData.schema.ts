import { SleepQuality } from '~/constants/enums'
import { calculateBMI } from '~/utils/health-formulas'

interface IHealthData {
  userId: string
  date?: string
  height: number
  weight: number
  heartRate: number
  bloodPressure: { systolic: number; diastolic: number }
  sleep: { duration: number; quality: SleepQuality }
  caloriesConsumed: number
  caloriesBurned: number
  waterIntake: number
}
export class HealthData {
  userId: string
  date: string
  height: number
  weight: number
  bmi: number
  heartRate: number
  bloodPressure: { systolic: number; diastolic: number }
  sleep: { duration: number; quality: SleepQuality }
  caloriesConsumed: number
  caloriesBurned: number
  waterIntake: number
  created_at?: Date
  updated_at?: Date

  constructor(healthData: IHealthData) {
    const date = new Date()
    this.userId = healthData.userId
    this.date = healthData.date || date.toISOString()
    this.heartRate = healthData.heartRate
    this.bloodPressure = healthData.bloodPressure
    this.sleep = healthData.sleep
    this.caloriesConsumed = healthData.caloriesConsumed
    this.caloriesBurned = healthData.caloriesBurned
    this.waterIntake = healthData.waterIntake
    this.height = healthData.height
    this.weight = healthData.weight
    this.bmi = calculateBMI(healthData.weight, healthData.height)
    this.created_at = date
    this.updated_at = date
  }
}
