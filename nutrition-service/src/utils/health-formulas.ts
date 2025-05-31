import { ActivityLevel, BMIStatus, Gender } from '~/constants/enums'

interface UserProfile {
  age: number
  gender: Gender
  height: number
  weight: number
  activityLevel: ActivityLevel
}

/**
 * Tính BMR (Basal Metabolic Rate) dựa trên công thức Harris-Benedict sửa đổi
 * @param user Thông tin người dùng
 * @returns BMR (kcal/ngày)
 */
export const calculateBMR = (user: UserProfile): number => {
  if (user.gender === Gender.Male) {
    return 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
  } else {
    return 10 * user.weight + 6.25 * user.height - 5 * user.age - 161
  }
}

/**
 * Tính TDEE (Total Daily Energy Expenditure) dựa trên BMR và mức độ hoạt động
 * @param bmr BMR (kcal/ngày)
 * @param activityLevel Mức độ hoạt động
 * @returns TDEE (kcal/ngày)
 * @source [5] WHO, Food Nutr. Bull., 2005
 */
export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  const pal = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }[activityLevel]
  return bmr * pal
}

/**
 * Tính nhịp tim tối đa dựa trên tuổi
 * @param age Tuổi của người dùng
 * @returns Nhịp tim tối đa (bpm)
 * @source [4] AHA, Target heart rates chart
 */
export const calculateMaxHeartRate = (age: number): number => {
  return 220 - age
}

export const calculateBMI = (weight: number, height: number): number => {
  return +(weight / (height / 100) ** 2).toFixed(2)
}
export const calculateWaterNeed = (gender: Gender): number => {
  return gender === Gender.Male ? 3.7 : 2.7
}
export const getBMIStatus = (bmi: number): string => {
  if (bmi < 18.5) return BMIStatus.Underweight
  if (bmi < 25) return BMIStatus.Normal
  if (bmi < 30) return BMIStatus.Overweight
  if (bmi < 35) return BMIStatus.Obesity
  return BMIStatus.ExtremelyObesity
}
