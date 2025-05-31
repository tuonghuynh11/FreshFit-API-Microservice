import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { calculateBMR, calculateTDEE } from '~/utils/health-formulas'
import { ActivityLevel, Gender, SleepQuality } from '~/constants/enums'
import { calculateAge } from '~/utils/commons'

interface Alert {
  message: string
  advice: string
}
class AlertService {
  async checkHealthRisks(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = []
    const user = await databaseService.users.findOne({
      _id: new ObjectId(userId)
    })
    if (!user)
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    const age = calculateAge(user.date_of_birth!)

    // Tính BMR (Revised Harris-Benedict) [4]
    const bmr = calculateBMR({
      activityLevel: user.activityLevel as ActivityLevel,
      height: Number(user.height),
      weight: Number(user.weight),
      age: age,
      gender: user.gender as Gender
    })

    // Calculate water requirement
    const waterThreshold = user.gender === Gender.Male ? 3700 : 2700

    // Tính TDEE dựa trên mức độ hoạt động [5]
    const tdee = calculateTDEE(bmr, user.activityLevel as ActivityLevel)

    // Lấy dữ liệu gần đây
    const recentHealthData = await databaseService.healthData.find({ userId }).sort({ date: -1 }).limit(1).toArray()
    const recentActivityData = recentHealthData ? recentHealthData : []
    const recentNutritionData = recentHealthData ? recentHealthData : []

    // Kiểm tra nhịp tim [4]
    const maxHeartRate = 220 - age
    const heartRateMin = maxHeartRate * 0.5
    const heartRateMax = maxHeartRate * 0.85
    if (
      recentHealthData &&
      recentHealthData.every((data) => data.heartRate < heartRateMin || data.heartRate > heartRateMax)
    ) {
      alerts.push({
        message: `Your heart rate is abnormal (${recentHealthData[0].heartRate} bpm). Please consult a doctor.`,
        advice: 'Rest, avoid caffeine, and see a doctor if the condition persists.'
      })
    }

    // Kiểm tra huyết áp [5]
    if (
      recentHealthData
        .slice(0, 2)
        .every(
          (data) =>
            data.bloodPressure.systolic >= 140 ||
            data.bloodPressure.diastolic >= 90 ||
            data.bloodPressure.systolic < 90 ||
            data.bloodPressure.diastolic < 60
        )
    ) {
      const isHigh = recentHealthData[0].bloodPressure.systolic >= 140
      alerts.push({
        message: `Your blood pressure is abnormally ${isHigh ? 'high' : 'low'}.`,
        advice: isHigh
          ? 'Reduce salt intake, engage in light exercise, and consult a doctor.'
          : 'Stay hydrated, rest, and see a doctor.'
      })
    }

    // Kiểm tra giấc ngủ [6]
    let sleepThreshold: number
    if (age <= 1)
      sleepThreshold = 14 // Trẻ mới sinh/infants
    else if (age <= 2)
      sleepThreshold = 11 // Trẻ mới biết đi
    else if (age <= 5)
      sleepThreshold = 10 // Trẻ mẫu giáo
    else if (age <= 12)
      sleepThreshold = 9 // Trẻ ở độ tuổi đi học
    else if (age <= 17)
      sleepThreshold = 8 // Thanh thiếu niên
    else if (age <= 64)
      sleepThreshold = 7 // Thanh niên/người lớn
    else sleepThreshold = 7 // Người lớn tuổi
    if (
      recentHealthData.every((data) => data.sleep.duration < sleepThreshold || data.sleep.quality === SleepQuality.Poor)
    ) {
      alerts.push({
        message: `Your sleep is insufficient (<${sleepThreshold} hours) or of poor quality.`,
        advice: 'Create a dark, quiet sleep environment and avoid screens before bed.'
      })
    }

    // Check calories burned
    if (recentActivityData.every((data) => data.caloriesBurned > tdee * 0.9)) {
      alerts.push({
        message: 'You are overexercising.',
        advice: 'Switch to light activities like yoga or walking.'
      })
    }
    // Check validity of calories burned
    if (recentActivityData.every((data) => data.caloriesBurned > tdee * 0.5)) {
      alerts.push({
        message: 'Your burned calories seem unusual. Please check your data.',
        advice: 'Ensure data accuracy or consult a professional.'
      })
    }

    // Check calories consumed [7]
    if (recentNutritionData.every((data) => data.caloriesConsumed < tdee * 0.7)) {
      alerts.push({
        message: 'Your calorie intake is too low.',
        advice: 'Incorporate nutrient-rich foods like oats, bananas, or chicken.'
      })
    }

    // Check water intake [8]
    if (recentNutritionData.every((data) => data.waterIntake < waterThreshold * 0.75)) {
      alerts.push({
        message: `You are drinking too little water. Aim for at least ${waterThreshold} ml per day.`,
        advice: 'Set reminders to drink water every 2 hours or carry a water bottle.'
      })
    }

    return alerts
  }
}

const alertService = new AlertService()
export default alertService
