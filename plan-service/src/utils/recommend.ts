import { ActivityLevel, Gender } from '~/constants/enums'
import Logger from './logger'

// Function to calculate BMR
const calculateBMR = (weight: number, height: number, age: number, gender: Gender): number => {
  return gender === 'Male' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161
}

// Function to calculate TDEE
const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  return bmr * (activityMultipliers[activityLevel] || 1.2)
}

// Function to calculate time to reach weight goal
const calculateTimeToGoal = (currentWeight: number, desiredWeight: number, calorieChangePerDay: number): number => {
  const weightChange = desiredWeight - currentWeight // Positive for weight gain, negative for weight loss
  const totalCaloriesNeeded = weightChange * 7700 // Total calories needed to achieve the goal
  const timeInDays = totalCaloriesNeeded / calorieChangePerDay
  return Math.abs(timeInDays) // Return absolute value to ensure positive days
}

// Function to calculate calorie range
const calculateCalorieRange = (tdee: number, calorieChangePerDay: number): [number, number] => {
  const minCalories = tdee - calorieChangePerDay // Calorie deficit for weight loss
  const maxCalories = tdee + calorieChangePerDay // Calorie surplus for weight gain
  return [minCalories, maxCalories]
}

export const recommendCalorieAndTimeToAchieveGoal = ({
  currentWeight,
  desiredWeight,
  height,
  age,
  gender = Gender.Male,
  activityLevel = ActivityLevel.Light,
  calorieChangePerDay = 1500
}: {
  currentWeight: number
  desiredWeight: number
  height: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  calorieChangePerDay?: number
}) => {
  // Calculate BMR and TDEE based on current weight
  const bmr = calculateBMR(currentWeight, height, age, gender)
  const tdee = calculateTDEE(bmr, activityLevel)

  // Daily calorie surplus or deficit
  // const calorieChangePerDay = 1500 // Positive for surplus, negative for deficit

  // Calculate minimum and maximum calorie range
  const [minCalories, maxCalories] = calculateCalorieRange(tdee, calorieChangePerDay)

  // Calculate time to achieve goal
  const daysToGoal = calculateTimeToGoal(currentWeight, desiredWeight, Math.round((minCalories + maxCalories) / 2))

  // Display results
  Logger.info(`BMR: ${bmr.toFixed(2)} cal/day`)
  Logger.info(`TDEE: ${tdee.toFixed(2)} cal/day`)
  Logger.info(`Minimum calories to reach goal: ${minCalories.toFixed(2)} cal/day`)
  Logger.info(`Maximum calories to reach goal: ${maxCalories.toFixed(2)} cal/day`)

  if (desiredWeight > currentWeight) {
    Logger.info(`Time to gain weight from ${currentWeight} kg to ${desiredWeight} kg: ${daysToGoal.toFixed(2)} days`)
  } else {
    Logger.info(`Time to lose weight from ${currentWeight} kg to ${desiredWeight} kg: ${daysToGoal.toFixed(2)} days`)
  }

  return {
    bmr: bmr.toFixed(2),
    tdee: tdee.toFixed(2),
    minCalories: Math.round(minCalories),
    maxCalories: Math.round(maxCalories),
    totalCalories: Math.round((minCalories + maxCalories) / 2) * daysToGoal, // Tổng thâm hụt caloies
    daysToGoal: Math.round(daysToGoal),
    unit: 'cal/day'
  }
}

// Thâm hụt calories  = Tổng lượng calo đốt cháy  - Tổng lượng calo nạp vào
// Thâm hụt calories phải lớn hơn 0
