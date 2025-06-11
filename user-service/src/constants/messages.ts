export const USERS_MESSAGES = {
  GET_ALL_USERS_SUCCESS: 'GET_ALL_USERS_SUCCESS',
  ACCOUNT_IS_ONLINE: 'Account is online. Please log out and try again.',
  VALIDATION_ERROR: 'Validation error',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name must be from 1 to 100 characters long',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_NOT_VALID: 'Email is not valid',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password must be from 6 to 50 characters long',
  PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS_LONG_AND_CONTAIN_AT_LEAST_1_LOWERCASE_1_UPPERCASE_1_NUMBER_AND_1_SYMBOL:
    'Password must be at least 6 characters long and contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password must be from 6 to 50 characters long',
  CONFIRM_PASSWORD_MUST_BE_EQUAL_TO_PASSWORD: 'Confirm password must be equal to password',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_SUCCESSFUL: 'Refresh token has been successfully',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify successful',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email successful',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token successful',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  RESET_PASSWORD_SUCCESS: 'Reset password successful',
  GET_MY_PROFILE_SUCCESS: 'Get my profile successful',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_A_STRING: 'BIO must be a string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'BIO must be from 1 to 200 characters long',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_200: 'Location must be from 1 to 200 characters long',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website must be from 1 to 200 characters long',
  USERNAME_MUST_BE_A_STRING: 'User name must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_50: 'User name must be from 1 to 50 characters long',
  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400: 'Image URL must be from 1 to 400 characters long',
  UPDATE_MY_PROFILE_SUCCESS: 'Update profile successful',
  GET_PROFILE_SUCCESS: 'Get profile successful',
  FOLLOW_SUCCESS: 'Follow successful',
  INVALID_USER_ID: 'Invalid user id',
  FOLLOW_USER_NOT_VERIFIED_OR_BANED: 'Unable to follow user. The user account has not been verified or has been banned',
  FOLLOWED: 'Followed user',
  ALREADY_UNFOLLOWED: 'Already unfollowed user',
  UNFOLLOW_SUCCESS: 'Unfollow Successfully',
  USERNAME_ALREADY_EXISTS: 'User name already exists',
  USERNAME_INVALID:
    'User name must be 4-15 characters long and contain only letters, numbers, underscore, not only numbers',
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  CHANGE_PASSWORDS_SUCCESS: 'Change passwords successful',
  GMAIL_NOT_VERIFIED: 'Email not verified',
  UPLOAD_SUCCESS: 'Upload successful',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successful',
  GET_RANDOM_USERS_SUCCESS: 'Get random user successful',
  GET_FOLLOWER_SUCCESS: 'Get followers successful',
  USERNAME_IS_REQUIRED: 'Username is required',
  GENDER_MUST_BE_A_NUMBER: 'Gender must be a number',
  USER_NOT_PERMISSION_FOR_THIS_ACTION: 'User not permission for this action',
  BAN_USER_SUCCESS: 'Ban user successful',
  UNBAN_USER_SUCCESS: 'Unban user successful',
  ACCOUNT_IS_BANNED: 'Account is banned',
  USER_ID_INVALID: 'User ID is invalid',
  USER_IS_NOT_EXISTED: 'User is not exists',
  MISSING_EMAIL_OR_USERNAME: 'Missing email or username',
  OTP_CODE_EXPIRED: 'OTP code expired',
  INVALID_OTP_CODE: 'Invalid OTP code',
  VERIFY_OTP_CODE_SUCCESS: 'Verify OTP code successful',
  HEIGHT_MUST_BE_A_NUMBER: 'Height must be a number',
  WEIGHT_MUST_BE_A_NUMBER: 'Weight must be a number',
  GOAL_WEIGHT_MUST_BE_A_NUMBER: 'Goal weight must be a number',
  LEVEL_MUST_BE_A_NUMBER: 'Level must be a number',
  INVALID_GENDER: 'Invalid gender',
  INVALID_LEVEL: 'Invalid level',
  GET_USER_HEALTH_TRACKING_SUCCESS: 'Get user health tracking successful',
  UPDATE_USER_WATER_ACTIVITY_SUCCESS: 'Update user water activity successful',
  UPDATE_HEALTH_ACTIVITY_SUCCESS: 'Update health activity successful',
  UPDATE_HEALTH_ACTIVITY_DETAIL_SUCCESS: 'Update health activity detail successful',
  FAILED_TO_CREATE_HEALTH_TRACKING_DETAIL: 'Failed to create health tracking detail',
  UPDATE_USER_NOTIFY_SETTINGS_SUCCESS: 'Update user notify settings successful',
  USER_NOT_ENOUGH_INFO: 'User not available enough information',
  START_GOAL_SUCCESS: 'Start goals successful',
  UPDATE_GOAL_STATUS_SUCCESS: 'Update goals status successful',
  OTP_CODE_IS_REQUIRED: 'OTP code is required',
  GET_USER_SUCCESS: 'Get user successful',
  CREATE_EXPERT_USER_SUCCESS: 'Create expert user successful',
  NO_PERMISSION: 'No permission',
  STORE_FCM_TOKEN_SUCCESS: 'Store FCM token successful',
  CREATE_ZEGO_TOKEN_SUCCESS: 'Create Zego token successful',
  ADD_HEALTH_ACTIVITY_SUCCESS: 'Add health activity successful',
  ADD_HEALTH_ACTIVITY_DETAIL_SUCCESS: 'Add health activity detail successful',
  UPDATE_USER_PROFILE_INTERNAL_SUCCESS: 'Update user profile internal successful'
} as const

export const PAGINATION_MESSAGES = {
  PAGE_SIZE_MAXIMUM_IS_100_AND_MINIMAL_IS_ONE: 'Page size maximum is 100 and minimal is one',
  PAGE_IS_ALWAYS_GREATER_THAN_OR_EQUAL_TO_ONE: 'Page is always greater than or equal to one'
}
export const MEALS_MESSAGES = {
  ADD_MEAL_SUCCESS: 'Add meal successful',
  UPDATE_MEAL_SUCCESS: 'Update meal successful',
  MEAL_NOT_FOUND: 'Meal not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this meal',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this meal',
  MEAL_ALREADY_USED: 'This meal is being used by other users or challenges so you cannot delete it',
  DELETE_MEAL_SUCCESS: 'Delete meal successful',
  GET_MEAL_SUCCESS: 'Get meal successful',
  NO_GET_PERMISSION: 'You do not have permission to get this meal information',
  INVALID_MEAL_TYPE: 'Invalid meal type',
  INVALID_MEAL_TYPE_FILTER: 'Invalid meal type filter',
  CLONE_MEAL_SUCCESS: 'Clone meal successful',
  SOME_MEALS_NOT_FOUND: 'Some meals are not found',
  MEAL_IS_PART_OF_HEALTH_TRACKING: 'This meal is part of health tracking, so you cannot delete it',
  MEAL_IS_PART_OF_CHALLENGE: 'This meal is part of challenge, so you cannot delete it'
}

export const DATE_MESSAGES = {
  INVALID_DATE: 'INVALID date'
}

export const EXERCISE_MESSAGES = {
  ADD_EXERCISE_SUCCESS: 'Add exercise successful',
  UPDATE_EXERCISE_SUCCESS: 'Update exercise successful',
  EXERCISE_NOT_FOUND: 'Exercise not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this exercise',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this exercise',
  EXERCISE_ALREADY_USED: 'This exercise is being used by other users or challenges so you cannot delete it',
  DELETE_EXERCISE_SUCCESS: 'Delete exercise successful',
  GET_EXERCISE_SUCCESS: 'Get exercise successful',
  NO_GET_PERMISSION: 'You do not have permission to get this exercise information',
  INVALID_EXERCISE_TYPE: 'Invalid exercise type',
  EXERCISE_EXISTS: 'Exercise already exists',
  GET_ALL_EXERCISE_SUCCESS: 'Get all exercise successful',
  EXERCISE_IS_USED: 'Exercise is used',
  EXERCISE_NOT_EXISTS: 'Exercise not exists',
  RATING_EXERCISE_SUCCESS: 'Rating exercise successful',
  INVALID_EXERCISE_CATEGORY: 'Invalid exercise category',
  INVALID_MECHANICS_TYPE: 'Invalid mechanics type',
  INVALID_FORCE_TYPE: " 'Invalid force type",
  INVALID_EXPERIENCE_LEVEL: 'Invalid experience level'
}

export const SETS_MESSAGES = {
  ADD_SET_SUCCESS: 'Add set successful',
  UPDATE_SET_SUCCESS: 'Update set successful',
  SET_NOT_FOUND: 'Set not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this set',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this set',
  SET_ALREADY_USED: 'This set is being used by other users or challenges so you cannot delete it',
  DELETE_SET_SUCCESS: 'Delete set successful',
  GET_SET_SUCCESS: 'Get set successful',
  NO_GET_PERMISSION: 'You do not have permission to get this set information',
  INVALID_SET_TYPE: 'Invalid set type',
  SET_EXISTS: 'Set already exists',
  GET_ALL_SET_SUCCESS: 'Get all set successful',
  SET_IS_USED: 'Set is used',
  INVALID_SET_STATUS: 'Invalid set status',
  INVALID_NUMBER_OF_EXERCISES: 'Invalid number of exercises',
  SET_NAME_EXISTS: 'Set name already exists',
  CLONE_SETS_SUCCESS: 'Clone sets successful',
  RATING_SUCCESS: 'Rating set successfully',
  NO_RATING_PERMISSION: 'No permissions for rating this set',
  SOME_SET_NOT_FOUND: 'Some sets are not found'
}

export const FILTER_MESSAGES = {
  INVALID_ROLE_TYPE: 'Invalid role type'
}

export const SET_EXERCISE_MESSAGES = {
  ADD_SET_EXERCISE_SUCCESS: 'Add set exercise successful',
  UPDATE_SET_EXERCISE_SUCCESS: 'Update set exercise successful',
  SET_EXERCISE_NOT_FOUND: 'Set exercise not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this set exercise',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this set exercise',
  SET_EXERCISE_ALREADY_USED: 'This set exercise is being used by other users or challenges so you cannot delete it',
  DELETE_SET_EXERCISE_SUCCESS: 'Delete set exercise successful',
  GET_SET_EXERCISE_SUCCESS: 'Get set exercise successful',
  NO_GET_PERMISSION: 'You do not have permission to get this set exercise information',
  INVALID_SET_EXERCISE_TYPE: 'Invalid set exercise type',
  SET_EXERCISE_EXISTS: 'Set exercise already exists',
  GET_ALL_SET_EXERCISE_SUCCESS: 'Get all set exercise successful',
  SET_EXERCISE_IS_USED: 'Set exercise is used',
  INVALID_SET_EXERCISE_STATUS: 'Invalid set exercise status',
  NO_ADD_PERMISSIONS: 'You do not have permission to add this set exercise'
}

export const WORKOUT_PLAN_MESSAGES = {
  ADD_WORKOUT_PLAN_SUCCESS: 'Add workout plan successful',
  UPDATE_WORKOUT_PLAN_SUCCESS: 'Update workout plan successful',
  WORKOUT_PLAN_NOT_FOUND: 'Workout plan not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this workout plan',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this workout plan',
  WORKOUT_PLAN_ALREADY_USED: 'This workout plan is being used by other users or challenges so you cannot delete it',
  DELETE_WORKOUT_PLAN_SUCCESS: 'Delete workout plan successful',
  GET_WORKOUT_PLAN_SUCCESS: 'Get workout plan successful',
  NO_GET_PERMISSION: 'You do not have permission to get this workout plan information',
  INVALID_WORKOUT_PLAN_TYPE: 'Invalid workout plan type',
  WORKOUT_PLAN_EXISTS: 'Workout plan already exists',
  GET_ALL_WORKOUT_PLAN_SUCCESS: 'Get all workout plan successful',
  WORKOUT_PLAN_IS_USED: 'Workout plan is used',
  INVALID_WORKOUT_PLAN_STATUS: 'Invalid workout plan status',
  NO_ADD_PERMISSIONS: 'You do not have permission to add this workout plan',
  WORKOUT_PLAN_NAME_EXISTS: 'Workout plan name already exists',
  START_DATE_MUST_BE_ISO8601: 'Start date must be ISO8601',
  END_DATE_MUST_BE_ISO8601: 'End date must be ISO8601'
}

export const WORKOUT_PLAN_DETAILS_MESSAGES = {
  ADD_WORKOUT_PLAN_DETAILS_SUCCESS: 'Add workout plan details successful',
  UPDATE_WORKOUT_PLAN_DETAILS_SUCCESS: 'Update workout plan details successful',
  WORKOUT_PLAN_DETAILS_NOT_FOUND: 'Workout plan details not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this workout plan details',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this workout plan details',
  WORKOUT_PLAN_DETAILS_ALREADY_USED:
    'This workout plan details is being used by other users or challenges so you cannot delete it',
  DELETE_WORKOUT_PLAN_DETAILS_SUCCESS: 'Delete workout plan details successful',
  GET_WORKOUT_PLAN_DETAILS_SUCCESS: 'Get workout plan details successful',
  NO_GET_PERMISSION: 'You do not have permission to get this workout plan details information',
  INVALID_WORKOUT_PLAN_DETAILS_TYPE: 'Invalid workout plan details type',
  WORKOUT_PLAN_DETAILS_EXISTS: 'Workout plan details already exists',
  GET_ALL_WORKOUT_PLAN_DETAILS_SUCCESS: 'Get all workout plan details successful',
  WORKOUT_PLAN_DETAILS_IS_USED: 'Workout plan details is used',
  INVALID_WORKOUT_PLAN_DETAILS_STATUS: 'Invalid workout plan details status',
  ADD_SET_FOR_WORKOUT_PLAN_DETAILS_SUCCESS: 'Add set for workout plan details successful',
  DELETE_SET_IN_WORKOUT_PLAN_DETAILS_SUCCESS: 'Delete set in workout plan details successful'
}

export const CHALLENGE_MESSAGES = {
  ADD_CHALLENGE_SUCCESS: 'Add challenge successful',
  UPDATE_CHALLENGE_SUCCESS: 'Update challenge successful',
  CHALLENGE_NOT_FOUND: 'Challenge not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this challenge',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this challenge',
  CHALLENGE_ALREADY_USED: 'This challenge is being used by other users or challenges so you cannot delete it',
  DELETE_CHALLENGE_SUCCESS: 'Delete challenge successful',
  GET_CHALLENGE_SUCCESS: 'Get challenge successful',
  NO_GET_PERMISSION: 'You do not have permission to get this challenge information',
  INVALID_CHALLENGE_TYPE: 'Invalid challenge type',
  CHALLENGE_EXISTS: 'Challenge already exists',
  GET_ALL_CHALLENGE_SUCCESS: 'Get all challenge successful',
  CHALLENGE_IS_USED: 'Challenge is used',
  INVALID_CHALLENGE_TARGET: 'Invalid challenge target',
  START_DATE_MUST_BE_ISO8601: 'Start date must be ISO8601',
  END_DATE_MUST_BE_ISO8601: 'End date must be ISO8601',
  UPDATE_MEAL_CHALLENGE_SUCCESS: 'Update meal challenge successful',
  CHALLENGE_NOT_HAVE_MEAL: "This challenge doesn't have meal",
  UPDATE_WORKOUT_CHALLENGE_SUCCESS: 'Update workout challenge successful',
  CHALLENGE_NOT_HAVE_WORKOUT_PLAN: "This challenge doesn't have workout plan",
  JOIN_CHALLENGE_SUCCESS: 'Join challenge successful',
  CHALLENGE_IS_JOINED: 'Challenge is joined',
  ACTIVATE_CHALLENGE_SUCCESS: 'Activate challenge successful',
  DEACTIVATE_CHALLENGE_SUCCESS: 'Deactivate challenge successful',
  CHALLENGE_MUST_HAVE_HEALTH_PLAN: 'Challenge must have health plan',
  CHALLENGE_EXPIRED: 'Challenge expired',
  CHALLENGE_NOT_ACTIVE: 'Challenge not active',
  CHALLENGE_NAME_EXISTS: 'Challenge name already exists'
}
export const DISH_MESSAGES = {
  ADD_DISH_SUCCESS: 'Add dish successful',
  UPDATE_DISH_SUCCESS: 'Update dish successful',
  DISH_NOT_FOUND: 'Dish not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this dish',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this dish',
  DISH_ALREADY_USED: 'This dish is being used by other users or challenges so you cannot delete it',
  DELETE_DISH_SUCCESS: 'Delete dish successful',
  GET_DISH_SUCCESS: 'Get dish successful',
  NO_GET_PERMISSION: 'You do not have permission to get this dish information',
  INVALID_DISH_TYPE: 'Invalid dish type',
  DISH_EXISTS: 'Dish already exists',
  GET_ALL_DISH_SUCCESS: 'Get all dish successful',
  DISH_IS_USED: 'Dish is used',
  INVALID_DISH_CATEGORY: 'Invalid dish category',
  INVALID_DISH_CATEGORY_FILTER: 'Invalid dish category filter',
  CLONE_DISH_SUCCESS: 'Clone dish successful',
  RATING_SUCCESS: 'Rating successful',
  NO_RATING_PERMISSION: 'No permission for rating this dish'
}
export const INGREDIENT_MESSAGES = {
  ADD_INGREDIENT_SUCCESS: 'Add ingredient successful',
  UPDATE_INGREDIENT_SUCCESS: 'Update ingredient successful',
  INGREDIENT_NOT_FOUND: 'Ingredient not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this ingredient',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this ingredient',
  INGREDIENT_ALREADY_USED: 'This ingredient is being used by other users or challenges so you cannot delete it',
  DELETE_INGREDIENT_SUCCESS: 'Delete ingredient successful',
  GET_INGREDIENT_SUCCESS: 'Get ingredient successful',
  NO_GET_PERMISSION: 'You do not have permission to get this ingredient information',
  INVALID_INGREDIENT_TYPE: 'Invalid ingredient type',
  INGREDIENT_EXISTS: 'Ingredient already exists',
  GET_ALL_INGREDIENT_SUCCESS: 'Get all ingredient successful',
  INGREDIENT_IS_USED: 'Ingredient is used',
  INVALID_INGREDIENT_CATEGORY: 'Invalid ingredient category',
  INVALID_INGREDIENT_CATEGORY_FILTER: 'Invalid ingredient category filter',
  CLONE_INGREDIENT_SUCCESS: 'Clone ingredient successful',
  SOME_INGREDIENTS_NOT_FOUND: 'Some ingredients are not found'
}

export const DISH_INGREDIENT_MESSAGES = {
  ADD_DISH_INGREDIENT_SUCCESS: 'Add dish ingredient successful',
  UPDATE_DISH_INGREDIENT_SUCCESS: 'Update dish ingredient successful',
  DISH_INGREDIENT_NOT_FOUND: 'Dish ingredient not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this dish ingredient',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this dish ingredient',
  DISH_INGREDIENT_ALREADY_USED:
    'This dish ingredient is being used by other users or challenges so you cannot delete it',
  DELETE_DISH_INGREDIENT_SUCCESS: 'Delete dish ingredient successful',
  GET_DISH_INGREDIENT_SUCCESS: 'Get dish ingredient successful',
  NO_GET_PERMISSION: 'You do not have permission to get this dish ingredient information',
  INVALID_DISH_INGREDIENT_TYPE: 'Invalid dish ingredient type',
  DISH_INGREDIENT_EXISTS: 'Dish ingredient already exists',
  GET_ALL_DISH_INGREDIENT_SUCCESS: 'Get all dish ingredient successful',
  DISH_INGREDIENT_IS_USED: 'Dish ingredient is used',
  INVALID_DISH_INGREDIENT_STATUS: 'Invalid dish ingredient status',
  NO_ADD_PERMISSIONS: 'You do not have permission to add this dish ingredient'
}

export const HEALTH_TRACKING_MESSAGES = {
  ADD_HEALTH_TRACKING_SUCCESS: 'Add health tracking successful',
  UPDATE_HEALTH_TRACKING_SUCCESS: 'Update health tracking successful',
  HEALTH_TRACKING_NOT_FOUND: 'Health tracking not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this health tracking',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this health tracking',
  HEALTH_TRACKING_ALREADY_USED:
    'This health tracking is being used by other users or challenges so you cannot delete it',
  DELETE_HEALTH_TRACKING_SUCCESS: 'Delete health tracking successful',
  GET_HEALTH_TRACKING_SUCCESS: 'Get health tracking successful',
  NO_GET_PERMISSION: 'You do not have permission to get this health tracking information',
  INVALID_HEALTH_TRACKING_TYPE: 'Invalid health tracking type',
  HEALTH_TRACKING_EXISTS: 'Health tracking already exists',
  GET_ALL_HEALTH_TRACKING_SUCCESS: 'Get all health tracking successful',
  HEALTH_TRACKING_IS_USED: 'Health tracking is used',
  INVALID_HEALTH_TRACKING_STATUS: 'Invalid health tracking status',
  ADD_HEALTH_TRACKING_DETAIL_SUCCESS: 'Add health tracking detail successful',
  DELETE_HEALTH_TRACKING_DETAIL_SUCCESS: 'Delete health tracking detail successful'
}

export const HEALTH_TRACKING_DETAIL_MESSAGES = {
  ADD_HEALTH_TRACKING_DETAIL_SUCCESS: 'Add health tracking detail successful',
  UPDATE_HEALTH_TRACKING_DETAIL_SUCCESS: 'Update health tracking detail successful',
  HEALTH_TRACKING_DETAIL_NOT_FOUND: 'Health tracking detail not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this health tracking detail',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this health tracking detail',
  HEALTH_TRACKING_DETAIL_ALREADY_USED:
    'This health tracking detail is being used by other users or challenges so you cannot delete it',
  DELETE_HEALTH_TRACKING_DETAIL_SUCCESS: 'Delete health tracking detail successful',
  GET_HEALTH_TRACKING_DETAIL_SUCCESS: 'Get health tracking detail successful',
  NO_GET_PERMISSION: 'You do not have permission to get this health tracking detail information',
  INVALID_HEALTH_TRACKING_DETAIL_TYPE: 'Invalid health tracking detail type',
  HEALTH_TRACKING_DETAIL_EXISTS: 'Health tracking detail already exists',
  GET_ALL_HEALTH_TRACKING_DETAIL_SUCCESS: 'Get all health tracking detail successful',
  HEALTH_TRACKING_DETAIL_IS_USED: 'Health tracking detail is used',
  CANNOT_DELETE_CONSUMED_TRACKING: 'Cannot delete consumed tracking',
  ADD_HEALTH_TRACKING_DETAIL_FOR_MEAL_SUCCESS: 'Add health tracking detail for meal successful',
  DELETE_DISHES_IN_HEALTH_TRACKING_DETAIL_FOR_MEAL_SUCCESS:
    'Delete dishes in health tracking detail for meal successful',
  DISHES_NOT_IN_MEAL: 'Dishes not in meal'
}

export const RECOMMEND_MESSAGES = {
  CREATE_CALORIE_AND_TIME_TO_GOAL_RECOMMEND_FOR_USER_SUCCESS:
    'Create calorie and time to goal recommend for user successful',
  GET_DISHES_RECOMMEND_FOR_USER_SUCCESS: 'Get dishes recommend for user successful',
  GET_WORKOUT_PLANS_RECOMMEND_FOR_USER_SUCCESS: 'Get workout plans recommend for user successful'
}

export const REPORT_MESSAGES = {
  ADD_REPORT_SUCCESS: 'Add report successful',
  REPORT_NOT_FOUND: 'Report not found',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this report',
  DELETE_REPORT_SUCCESS: 'Delete report successful',
  GET_REPORT_SUCCESS: 'Get report successful',
  NO_GET_PERMISSION: 'You do not have permission to get this report information',
  INVALID_REPORT_TYPE: 'Invalid report type',
  REPORT_EXISTS: 'Report already exists',
  GET_ALL_REPORT_SUCCESS: 'Get all report successful',
  REPORT_IS_USED: 'Report is used',
  READ_REPORT_SUCCESS: 'Read report successful',
  SOME_REPORT_NOT_FOUND: 'Some reports are not found'
}

export const CHAT_MESSAGES = {
  ADD_CHAT_SUCCESS: 'Add chat successful',
  UPDATE_CHAT_SUCCESS: 'Update chat successful',
  CHAT_NOT_FOUND: 'Chat not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this chat',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this chat',
  CHAT_ALREADY_USED: 'This chat is being used by other users or challenges so you cannot delete it',
  DELETE_CHAT_SUCCESS: 'Delete chat successful',
  GET_CHAT_SUCCESS: 'Get chat successful',
  NO_GET_PERMISSION: 'You do not have permission to get this chat information',
  INVALID_CHAT_TYPE: 'Invalid chat type',
  CHAT_EXISTS: 'Chat already exists',
  GET_ALL_CHAT_SUCCESS: 'Get all chat successful',
  CHAT_IS_USED: 'Chat is used',
  INVALID_CHAT_CATEGORY: 'Invalid chat category',
  INVALID_CHAT_CATEGORY_FILTER: 'Invalid chat category filter',
  CLONE_CHAT_SUCCESS: 'Clone chat successful',
  RATING_SUCCESS: 'Rating successful',
  NO_RATING_PERMISSION: 'No permission for rating this chat',
  SEND_MESSAGE_SUCCESS: 'Send message successful',
  CHAT_ROOM_NOT_FOUND: 'Chat room not found',
  CREATE_CHAT_ROOM_SUCCESS: 'Create chat room successful',
  DELETE_CHAT_ROOM_SUCCESS: 'Delete chat room successful',
  GET_ALL_CHAT_ROOM_SUCCESS: 'Get all chat room successful',
  GET_CHAT_MESSAGES_SUCCESS: 'Get chat messages successful'
}

export const STATISTIC_MESSAGES = {
  GET_STATISTIC_SUCCESS: 'Get statistic successful',
  GET_ALL_STATISTIC_SUCCESS: 'Get all statistic successful',
  GET_TOP_STATISTIC_SUCCESS: 'Get top statistic successful',
  TOP_VALUE_IS_GREATER_THAN_OR_EQUAL_TO_ONE: 'Top value is greater than or equal to one',
  GET_ACTIVE_USER_AND_CHALLENGES_STATISTIC_SUCCESS: 'Get active user and challenges statistic successful',
  GET_OVERVIEW_STATISTIC_SUCCESS: 'Get overview statistic successful',
  GET_USER_GROWTH_STATISTIC_SUCCESS: 'Get user growth statistic successful',
  YEAR_VALUE_IS_GREATER_THAN_OR_EQUAL_TO_ONE: 'Year value is greater than or equal to one',
  GET_AGE_STATISTIC_SUCCESS: 'Get age statistic successful',
  GET_USER_LEVEL_STATISTIC_SUCCESS: 'Get user level statistic successful',
  GET_USER_STATISTIC_SUCCESS: 'Get user statistic successful',
  GET_WORKOUTS_STATISTIC_SUCCESS: 'Get workouts statistic successful',
  MONTH_VALUE_IS_GREATER_THAN_OR_EQUAL_TO_ONE: 'Month value is greater than or equal to one',
  WEEK_VALUE_IS_GREATER_THAN_OR_EQUAL_TO_ONE: 'Week value is greater than or equal to one',
  GET_WORKOUTS_WEEKLY_COMPLETION_RATE_STATISTIC_SUCCESS: 'Get workouts weekly completion rate statistic successful',
  GET_NUTRITION_STATISTIC_SUCCESS: 'Get nutrition statistic successful'
}

export const FRUIT_MESSAGES = {
  GET_FRUIT_SUCCESS: 'Get fruit successful',
  GET_ALL_FRUIT_SUCCESS: 'Get all fruit successful',
  FRUIT_NOT_FOUND: 'Fruit not found'
}

export const TRANSACTION_MESSAGES = {
  CREATE_TRANSACTION_SUCCESS: 'Create transaction successful',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this transaction',
  DELETE_TRANSACTION_SUCCESS: 'Delete transaction successful',
  GET_TRANSACTION_SUCCESS: 'Get transaction successful',
  NO_GET_PERMISSION: 'You do not have permission to get this transaction information',
  INVALID_TRANSACTION_TYPE: 'Invalid transaction type',
  TRANSACTION_EXISTS: 'Transaction already exists',
  GET_ALL_TRANSACTION_SUCCESS: 'Get all transaction successful',
  TRANSACTION_IS_USED: 'Transaction is used',
  PAYMENT_SUCCESS: 'Payment successful',
  CHECK_TRANSACTION_STATUS_SUCCESS: 'Check transaction status successful',
  GET_TRANSACTION_BY_USERID_SUCCESS: 'Get transaction by userId successful',
  GET_TRANSACTION_BY_ACCESS_TOKEN_SUCCESS: 'Get transaction by access token successful',
  GET_TRANSACTION_DETAIL_SUCCESS: 'Get transaction detail successful',
  UPDATE_TRANSACTION_STATUS_SUCCESS: 'Update transaction status successful',
  REFUND_SUCCESS: 'Refund successful',
  MAKE_BOOKING_TRANSACTION_SUCCESS: 'Make booking transaction successful'
}
export const POST_MESSAGES = {
  INVALID_POST_TYPE: 'Invalid post type',
  INVALID_MEDIA_TYPE: 'Invalid media type',
  INVALID_POST_STATUS: 'Invalid post status',
  CREATE_POST_SUCCESS: 'Create post successfully',
  GET_POST_DETAIL_SUCCESS: 'Get post detail successfully',
  POST_NOT_FOUND: 'Post not found',
  GET_POST_SUCCESS: 'Get post successfully',
  POST_ALREADY_PUBLISHED: 'Post already published',
  APPROVE_POST_SUCCESS: 'Approve post successfully',
  REJECT_POST_SUCCESS: 'Reject post successfully',
  UNAUTHORIZED_DELETE_POST: 'Unauthorized delete post',
  DELETE_POST_SUCCESS: 'Delete post successfully',
  UPDATE_POST_SUCCESS: 'Update post successfully',
  UNAUTHORIZED_UPDATE_POST: 'Unauthorized update post',
  POST_IS_WAITING_FOR_APPROVAL: 'Post is waiting for approval',
  INVALID_POST_REACTION_TYPE: 'Invalid post reaction type',
  REACT_POST_SUCCESS: 'React post was successfully',
  POST_IS_UNPUBLISHED: 'Post is unpublished',
  GET_REACTIONS_OF_POST_SUCCESS: 'Get Reactions of post successfully',
  POST_ALREADY_REACTED: 'Post already reacted',
  POST_REACTION_NOT_FOUND: 'Post reaction not found',
  DELETE_POST_REACTION_SUCCESS: 'Delete post reaction successfully',
  UNAUTHORIZED_DELETE_POST_REACTION: 'Unauthorized delete post reaction',
  COMMENT_POST_SUCCESS: 'Comment post successfully',
  GET_COMMENT_OF_POST_SUCCESS: 'Get Comment of post successfully',
  DELETE_POST_COMMENT_SUCCESS: 'Delete post comment successfully',
  POST_COMMENT_NOT_FOUND: 'Post comment not found',
  UNAUTHORIZED_DELETE_POST_COMMENT: 'Unauthorized delete post comment',
  POST_COMMENT_HAS_CHILDREN: 'Comment has children',
  POST_ALREADY_BOOKMARKED: 'Post already bookmarked'
}
export const BOOKMARK_MESSAGES = {
  BOOKMARK_POST_SUCCESS: 'Bookmark post successfully',
  GET_BOOKMARK_SUCCESS: 'Get bookmark successfully',
  DELETE_BOOKMARK_SUCCESS: 'Delete bookmark successfully',
  BOOKMARK_NOT_FOUND: 'Bookmark not found'
}
export const POST_FEEDBACK_MESSAGES = {
  INVALID_POST_FEEDBACK_STATUS: 'Invalid post feedback status',
  UPDATE_POST_FEEDBACK_SUCCESS: 'Update post feedback',
  FEEDBACK_NOT_FOUND: 'Feedback not found'
}

export const HEALTH_MESSAGES = {
  BLOOD_PRESSURE_MUST_BE_OBJECT_WITH_SYSTOLIC_AND_DIASTOLIC:
    'Blood pressure must be object with systolic and diastolic',
  SLEEP_MUST_BE_OBJECT_WITH_DURATION_AND_QUALITY: 'Sleep must be object with duration and quality',
  CREATE_DAILY_HEALTH_SUMMARY_SUCCESS: 'Create daily health summary successful',
  GET_DAILY_HEALTH_SUMMARY_SUCCESS: 'Get daily health summary successful',
  GENERATE_HEALTH_PLAN_SUCCESS: 'Generate health plan successful'
}

export const NOTIFICATION_MESSAGES = {
  GET_NOTIFICATION_SUCCESS: 'Get notification successfully',
  MARK_READ_NOTIFICATION_SUCCESS: 'Mark read notification successfully',
  MARK_ALL_READ_NOTIFICATION_SUCCESS: 'Mark all read notification successfully',
  GET_COUNT_UNREAD_NOTIFICATION_SUCCESS: 'Get count unread notification successfully',
  INVALID_NOTIFICATION_TYPE: 'Invalid notification type',
  CREATE_NOTIFICATION_SUCCESS: 'Create notification successfully'
}

export const HEALTH_PLAN_MESSAGES = {
  ADD_HEALTH_PLAN_SUCCESS: 'Add health plan successful',
  UPDATE_HEALTH_PLAN_SUCCESS: 'Update health plan successful',
  HEALTH_PLAN_NOT_FOUND: 'Health plan not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this health plan',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this health plan',
  HEALTH_PLAN_ALREADY_USED: 'This health plan is being used by other users or challenges so you cannot delete it',
  DELETE_HEALTH_PLAN_SUCCESS: 'Delete health plan successful',
  GET_HEALTH_PLAN_SUCCESS: 'Get health plan successful',
  NO_GET_PERMISSION: 'You do not have permission to get this health plan information',
  INVALID_HEALTH_PLAN_TYPE: 'Invalid health plan type',
  HEALTH_PLAN_EXISTS: 'Health plan already exists',
  GET_ALL_HEALTH_PLAN_SUCCESS: 'Get all health plan successful',
  HEALTH_PLAN_IS_USED: 'Health plan is used',
  HEALTH_PLAN_NAME_EXISTS: 'Health plan name already exists',
  INVALID_HEALTH_PLAN_LEVEL: ' Invalid health plan level',
  INVALID_HEALTH_PLAN_STATUS: ' Invalid health plan status',
  HEALTH_PLAN_USED_IN_CHALLENGE: 'Health plan is used in challenge'
}

export const HEALTH_PLAN_DETAILS_MESSAGES = {
  ADD_HEALTH_PLAN_DETAILS_SUCCESS: 'Add health plan details successful',
  UPDATE_HEALTH_PLAN_DETAILS_SUCCESS: 'Update health plan details successful',
  HEALTH_PLAN_DETAILS_NOT_FOUND: 'Health plan details not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this health plan details',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this health plan details',
  HEALTH_PLAN_DETAILS_ALREADY_USED:
    'This health plan details is being used by other users or challenges so you cannot delete it',
  DELETE_HEALTH_PLAN_DETAILS_SUCCESS: 'Delete health plan details successful',
  GET_HEALTH_PLAN_DETAILS_SUCCESS: 'Get health plan details successful',
  NO_GET_PERMISSION: 'You do not have permission to get this health plan details information',
  INVALID_HEALTH_PLAN_DETAILS_TYPE: 'Invalid health plan details type',
  HEALTH_PLAN_DETAILS_EXISTS: 'Health plan details already exists',
  GET_ALL_HEALTH_PLAN_DETAILS_SUCCESS: 'Get all health plan details successful',
  HEALTH_PLAN_DETAILS_IS_USED: 'Health plan details is used',
  INVALID_HEALTH_PLAN_DETAILS_STATUS: ' Invalid health plan details status',
  ADD_SET_FOR_WORKOUT_DETAIL_SUCCESS: ' Add set for workout detail successful',
  UPDATE_WORKOUT_DETAIL_STATUS_SUCCESS: 'Update workout detail status successful',
  DELETE_ITEMS_IN_WORKOUT_DETAIL_SUCCESS: 'Delete items in workout detail successful',
  ADD_MEALS_FOR_NUTRITION_DETAIL_SUCCESS: ' Add meals for nutrition detail successful',
  UPDATE_ITEM_IN_NUTRITION_STATUS_SUCCESS: 'Update item in nutrition status successful',
  DELETE_ITEMS_IN_NUTRITION_DETAIL_SUCCESS: 'Delete items in nutrition detail successful',
  UPDATE_WORKOUT_DETAIL_ORDER_NUMBER_SUCCESS: 'Update workout detail order number successful'
}

export const USER_CHALLENGE_PARTICIPATION_MESSAGES = {
  ADD_USER_CHALLENGE_PARTICIPATION_SUCCESS: 'Add user challenge participation successful',
  UPDATE_USER_CHALLENGE_PARTICIPATION_SUCCESS: 'Update user challenge participation successful',
  USER_CHALLENGE_PARTICIPATION_NOT_FOUND: 'User challenge participation not found',
  NO_UPDATE_PERMISSION: 'You do not have permission to update this user challenge participation',
  NO_DELETE_PERMISSION: 'You do not have permission to delete this user challenge participation',
  USER_CHALLENGE_PARTICIPATION_ALREADY_USED:
    'This user challenge participation is being used by other users or challenges so you cannot delete it',
  DELETE_USER_CHALLENGE_PARTICIPATION_SUCCESS: 'Delete user challenge participation successful',
  GET_USER_CHALLENGE_PARTICIPATION_SUCCESS: 'Get user challenge participation successful',
  NO_GET_PERMISSION: 'You do not have permission to get this user challenge participation information',
  INVALID_USER_CHALLENGE_PARTICIPATION_TYPE: 'Invalid user challenge participation type',
  USER_CHALLENGE_PARTICIPATION_EXISTS: 'User challenge participation already exists',
  GET_ALL_USER_CHALLENGE_PARTICIPATION_SUCCESS: 'Get all user challenge participation successful',
  INVALID_USER_CHALLENGE_PARTICIPATION_STATUS: 'Invalid user challenge participation status',
  UPDATE_PROGRESS_EACH_DAY_SUCCESS: 'Update progress each day successful',
  USER_CHALLENGE_PARTICIPATION_PROGRESS_NOT_FOUND: 'User challenge participation progress not found',
  GET_USER_CHALLENGE_PROGRESS_SUCCESS: 'Get user challenge progress successful',
  GET_USER_CHALLENGE_OVERVIEW_SUCCESS: 'Get user challenge overview successful',
  FINISH_CHALLENGE_SUCCESS: 'Finish challenge successful',
  START_CHALLENGE_SUCCESS: 'Start challenge successful',
  USER_CHALLENGE_PARTICIPATION_NOT_STARTED: 'User challenge participation not started',
  USER_CHALLENGE_PARTICIPATION_NOT_PENDING: 'User challenge participation not pending',
  USER_CHALLENGE_PARTICIPATION_NOT_BELONG_TO_USER: 'User challenge participation not belong to user',
  YOU_HAVE_NOT_COMPLETED_ANY_PROGRESS: 'You have not completed any progress',
  COMPLETED_WORKOUT_IDS_NOT_IN_HEALTH_PLAN_DETAIL: 'Completed workout ids not in health plan detail',
  COMPLETED_NUTRITION_IDS_NOT_IN_HEALTH_PLAN_DETAIL: 'Completed nutrition ids not in health plan detail',
  START_CHALLENGE_FAILED: 'Start challenge failed',
  DELETE_CHALLENGE_FAILED: 'Delete challenge failed',
  USER_HAVE_NOT_JOINED_CHALLENGE: 'User have not joined challenge'
}

export const COMMON_MESSAGES = {
  DATE_MUST_BE_ISO8601: 'Date must be ISO8601',
  'MSG 1': 'Incorrect username or password',
  'MSG 2': "Email doesn't exist",
  'MSG 3': 'OTP code is invalid',
  'MSG 4': 'Your new password doesn’t meet the required format',
  'MSG 5': 'Email Already Registered',
  'MSG 6': 'Username Already Taken',
  'MSG 7': 'Height value invalid',
  'MSG 8': 'Weight value invalid',
  'MSG 9': 'Weight Goal value invalid',
  'MSG 10': 'Health Data Not Found',
  'MSG 11': 'Total calories exceed the allowable calories of the meal',
  'MSG 12': 'Calories not enough',
  'MSG 13': 'Some fields are empty',
  'MSG 14': 'Ingredient not found',
  'MSG 15': 'Total calories exceed the allowable calories of the workout plan',
  'MSG 16': 'Start Date must be less than End Date',
  'MSG 17': 'This challenge has ended. Check out other challenges!',
  'MSG 18': "Congratulations! You've completed the challenge! Check your award",
  'MSG 19': 'Save successfully!',
  'MSG 20': 'Send successfully!',
  'MSG 21': 'There are something wrong when sending the message, please try again later',
  'MSG 22': 'No information found',
  'MSG 23': 'Email is invalid',
  'MSG 24': 'Password is invalid',
  'MSG 25': 'Confirm Password is invalid',
  'MSG 26': 'Contact message is invalid',
  INVALID_STATUS: 'Invalid status'
}
