import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { envConfig } from '~/constants/config'
import databaseService from '~/services/database.services'
import { SetType } from '~/constants/enums'
import { toDate } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
interface ExerciseData {
  calories_per_rep: number
  calories_per_minute: number
  reps_per_round: number
  time_per_round: number // in minutes
  rest_time_per_round: number // in minutes
}

interface ExercisePlan {
  exercise_name: string
  calories_to_burn: number
  total_reps_needed: number
  rounds_needed: number
  total_time_needed: number // in minutes
  rest_time_per_round: number // in minutes
}
export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: envConfig.jwtSecretAccessToken
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: 'Access Token Error:' + capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  return true
}

export const numberOfDaysBetweenTwoDates = (date1: Date, date2: Date) => {
  // Calculate the time difference in milliseconds
  const timeDiff = Math.abs(date2.getTime() - date1.getTime())

  // Convert the time difference to days
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

  return Number(diffDays)
}

export const secondsToTime = (seconds: number) => {
  const hours: string = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const minutes: string = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const secs: string = (seconds % 60).toString().padStart(2, '0')

  return `${hours}:${minutes}:${secs}`
}

export const generateOTP = (length: number): string => {
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10) // Generates a digit from 0 to 9
  }
  return otp
}

export const generatePassword = (length: number): string => {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?'

  const allChars = upperCaseChars + lowerCaseChars + numberChars + symbolChars
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length)
    password += allChars[randomIndex]
  }

  return password
}

export const getNowDateWithoutTime = () => {
  //YYYY-MM-DD
  const now = new Date()
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return formattedDate
}

export const IsEmailExist = async (email: string) => {
  const user = await databaseService.users.findOne({ email })
  return !!user
}
export const IsUsernameExisted = async (username: string) => {
  const user = await databaseService.users.findOne({ username })
  return !!user
}
export const IsPasswordValid = async (password: string) => {
  // Example Google-like format requirements:
  // - At least 8 characters
  // - Contains at least one uppercase letter
  // - Contains at least one lowercase letter
  // - Contains at least one digit
  // - Contains at least one special character (!@#$%^&* etc.)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/

  return passwordRegex.test(password)
}

export const IsHeightValid = async (height: number) => {
  return height > 0
}
export const IsWeightValid = async (weight: number) => {
  return weight > 0
}
export const IsWeightGoalValid = async (weightGoal: number) => {
  return weightGoal > 0
}

function calculateExercisePlan(exerciseName: string, caloriesToBurn: number): ExercisePlan {
  // Predefined values for exercises
  const exerciseData: { [key: string]: ExerciseData } = {
    'Push Up': {
      calories_per_rep: 0.25,
      reps_per_round: 20,
      time_per_round: 5,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    Deadlift: {
      calories_per_rep: 0.5,
      reps_per_round: 10,
      time_per_round: 6,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    Squats: {
      calories_per_rep: 0.3,
      reps_per_round: 15,
      time_per_round: 4,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    Plank: {
      calories_per_rep: 0.1,
      calories_per_minute: 2,
      reps_per_round: 1,
      time_per_round: 1,
      rest_time_per_round: 1
    }, // Plank held for time
    Burpees: {
      calories_per_rep: 0.6,
      reps_per_round: 10,
      time_per_round: 8,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    'Jumping Jacks': {
      calories_per_rep: 0.2,
      reps_per_round: 30,
      time_per_round: 3,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    'Mountain Climbers': {
      calories_per_rep: 0.3,
      reps_per_round: 20,
      time_per_round: 5,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    'Pull Up': {
      calories_per_rep: 0.8,
      reps_per_round: 8,
      time_per_round: 7,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    'Bicycle Crunches': {
      calories_per_rep: 0.15,
      reps_per_round: 20,
      time_per_round: 4,
      rest_time_per_round: 1,
      calories_per_minute: 0
    },
    'Leg Raise': {
      calories_per_rep: 0.2,
      reps_per_round: 15,
      time_per_round: 5,
      rest_time_per_round: 1,
      calories_per_minute: 0
    }
  }

  // Get data for the specified exercise
  const data = exerciseData[exerciseName]
  if (data) {
    const { calories_per_rep, reps_per_round, time_per_round, rest_time_per_round, calories_per_minute } = data

    // Calculate total reps needed
    const total_reps_needed = caloriesToBurn / (exerciseName === 'Plank' ? calories_per_minute : calories_per_rep)

    // Calculate number of rounds needed
    const rounds_needed = total_reps_needed / reps_per_round

    // Calculate total time needed (including rest time)
    const total_time_needed = rounds_needed * (time_per_round + rest_time_per_round)

    return {
      exercise_name: exerciseName,
      calories_to_burn: Math.round(caloriesToBurn),
      total_reps_needed: Math.round(total_reps_needed),
      rounds_needed: Math.round(rounds_needed),
      total_time_needed: Math.round(total_time_needed),
      rest_time_per_round: Math.round(rest_time_per_round)
    }
  } else {
    return {
      exercise_name: '',
      calories_to_burn: 0,
      total_reps_needed: 0,
      rounds_needed: 0,
      total_time_needed: 0,
      rest_time_per_round: 0
    }
  }
}

export const getSetExercises = ({
  exercise_list,
  total_calories,
  number_of_sets = 3,
  number_exercise_of_set = 1
}: {
  exercise_list: any[]
  total_calories: number
  number_of_sets: number
  number_exercise_of_set: number
}) => {
  const caloriesPerSets = total_calories / number_of_sets
  const caloriesPerExercise = caloriesPerSets / number_exercise_of_set
  console.log('Calories per exercise: ' + caloriesPerExercise)
  const exercisePlan: any[] = []
  for (let i = 0; i < number_of_sets; i++) {
    const exercises = []
    let index = 0
    for (let j = 0; j < number_exercise_of_set; j++) {
      if (index >= exercise_list.length) {
        index = 0
      }
      const exercise = exercise_list[index]
      const { total_reps_needed, rounds_needed, total_time_needed, rest_time_per_round } = calculateExercisePlan(
        exercise.exercise,
        caloriesPerExercise
      )
      exercises.push({
        exercise_id: exercise.id,
        exercise_name: exercise.exercise,
        image: exercise.image,
        video: exercise.video,
        description: exercise.description,
        duration: total_time_needed, // minutes
        reps: total_reps_needed,
        round: rounds_needed,
        rest_per_round: rest_time_per_round, // minutes
        estimated_calories_burned: caloriesPerExercise // cal
      })
      index++
    }
    // Remove the first two elements (1 and 2)
    const removedElements = exercise_list.splice(0, number_exercise_of_set)

    // Add the removed elements to the end of the original array
    exercise_list.push(...removedElements)
    exercisePlan.push({
      name: `Set ${i + 1}`,
      type: SetType.Beginner,
      number_of_exercises: number_exercise_of_set,
      set_exercises: exercises
    })
  }

  return exercisePlan
}

export const generateExpertUniqueUsername = async (): Promise<string> => {
  let username: string
  let isTaken: boolean

  do {
    const randomNumber = Math.floor(100000 + Math.random() * 900000) // 6-digit number
    username = `expert${randomNumber}`
    isTaken = await IsUsernameExisted(username)
  } while (isTaken)

  return username
}

export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())

  if (!hasHadBirthdayThisYear) {
    age--
  }

  return age
}

export const getStartAndEndISO = (dateStr: string, timeZone: string): { start: string; end: string } => {
  const parts = dateStr.split('-')
  let start: Date
  let end: Date

  if (parts.length === 1) {
    // YYYY
    start = toDate(`${dateStr}-01-01T00:00:00`)
    end = toDate(`${+parts[0] + 1}-01-01T00:00:00`)
  } else if (parts.length === 2) {
    // YYYY-MM
    start = toDate(`${dateStr}-01T00:00:00`)
    const nextMonth = new Date(+parts[0], +parts[1], 1)
    end = toDate(nextMonth.toISOString().split('T')[0] + 'T00:00:00')
  } else if (parts.length === 3) {
    // YYYY-MM-DD
    start = toDate(`${dateStr}T00:00:00`)
    const startZoned = toZonedTime(start, timeZone)
    const endZoned = new Date(startZoned)
    endZoned.setDate(endZoned.getDate() + 1)
    end = endZoned
  } else {
    throw new Error('Invalid date string')
  }

  // Use formatInTimeZone to handle timeZone formatting
  return {
    start: formatInTimeZone(start, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    end: formatInTimeZone(end, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX")
  }
}

export function getDayAndWeekIndex(startDate: Date, endDate: Date, targetDate: Date) {
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate < startDate || targetDate > endDate) {
    return {
      valid: false,
      message: 'targetDate is out of challenge range'
    }
  }

  const diffDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const weekIndex = Math.ceil(diffDays / 7)

  // Get dayOfWeek as number (1 = Monday, ..., 7 = Sunday)
  // Get dayOfWeek as number (1 = Monday, ..., 7 = Sunday)
  const jsDay = targetDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfWeekNumber = jsDay === 0 ? 7 : jsDay // Convert to 1–7 (Monday = 1)

  return {
    valid: true,
    dayOfWeek: dayOfWeekNumber, // ví dụ: 1 (Monday)
    weekIndex, // ví dụ: 3
    dayIndex: diffDays // ví dụ: 15
  }
}
