import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { RoleTypeQueryFilter, UserRole } from '~/constants/enums'
import { SET_EXERCISE_MESSAGES, SETS_MESSAGES } from '~/constants/messages'
import { SetExerciseReqBody, UpdateSetExerciseReqBody } from '~/models/requests/SetExercise.requests'
import SetExercises from '~/models/schemas/SetExercises.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { omit } from 'lodash'

class SetExerciseService {
  async search({
    search,
    page,
    limit,
    type,
    sort_by = 'name',
    order_by = 'ASC',
    user_id,
    role
  }: {
    search?: string
    page?: number
    limit?: number
    sort_by: string
    order_by: string
    type: RoleTypeQueryFilter
    user_id?: string
    role: UserRole
  }) {
    const conditions: any = {}
    if (search) {
      conditions.name = {
        $regex: search,
        $options: 'i'
      }
    }

    if (type !== RoleTypeQueryFilter.All) {
      if (type === RoleTypeQueryFilter.System) {
        conditions.user_id = undefined
      } else {
        conditions.user_id = new ObjectId(user_id)
      }
    }

    const [sets, total] = await Promise.all([
      databaseService.sets
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.sets.countDocuments(conditions)
    ])
    return {
      sets,
      total
    }
  }

  async getById({ id, setId, user_id, role }: { id: string; setId: string; user_id: string; role: UserRole }) {
    const set = await databaseService.sets.findOne({
      _id: new ObjectId(setId)
    })
    if (!set) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: SETS_MESSAGES.SET_NOT_FOUND })
    }
    if (
      (role === UserRole.Admin && set?.user_id) ||
      (role === UserRole.User && !set?.user_id) ||
      (role === UserRole.User && set?.user_id && set?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: SET_EXERCISE_MESSAGES.NO_GET_PERMISSION })
    }

    const set_exercise = set.set_exercises.find((item: SetExercises) => item._id?.toString() === id)
    if (!set_exercise) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SET_EXERCISE_MESSAGES.SET_EXERCISE_NOT_FOUND
      })
    }

    return set_exercise
  }

  async add({
    setId,
    set_exercise,
    user_id,
    role
  }: {
    set_exercise: SetExerciseReqBody
    setId: string
    user_id: string
    role: UserRole
  }) {
    const set = await databaseService.sets.findOne({ _id: new ObjectId(setId) })
    if (!set) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: SETS_MESSAGES.SET_NOT_FOUND })
    }

    if (
      (role === UserRole.Admin && set?.user_id) ||
      (role === UserRole.User && !set?.user_id) ||
      (role === UserRole.User && set?.user_id && set?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: SET_EXERCISE_MESSAGES.NO_ADD_PERMISSIONS })
    }

    const setExercise = new SetExercises({
      ...set_exercise
    })

    const result = await databaseService.set_exercises.insertOne(setExercise)
    setExercise._id = result.insertedId

    await databaseService.sets.updateOne(
      {
        _id: new ObjectId(setId)
      },
      {
        $push: {
          set_exercises: setExercise
        },
        $inc: {
          number_of_exercises: 1,
          total_calories: setExercise.estimated_calories_burned || 0
        }
      }
    )

    return setExercise
  }
  async update({
    id,
    setId,
    updateSetExercise,
    role,
    user_id
  }: {
    id: string
    setId: string
    updateSetExercise: UpdateSetExerciseReqBody
    user_id: string
    role: UserRole
  }) {
    const set = await databaseService.sets.findOne({ _id: new ObjectId(setId) })
    if (!set) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: SETS_MESSAGES.SET_NOT_FOUND })
    }

    if (
      (role === UserRole.Admin && set?.user_id) ||
      (role === UserRole.User && !set?.user_id) ||
      (role === UserRole.User && set?.user_id && set?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: SET_EXERCISE_MESSAGES.NO_UPDATE_PERMISSION })
    }

    let index = 0
    const set_exercise_existed = set.set_exercises.find((item: SetExercises, i: number) => {
      index = i
      return item._id?.toString() === id
    })
    if (!set_exercise_existed) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SET_EXERCISE_MESSAGES.SET_EXERCISE_NOT_FOUND
      })
    }
    // Update the total calories burned in the set
    const current_total_calories = set.total_calories || 0
    const new_total_calories =
      current_total_calories -
      (set_exercise_existed.estimated_calories_burned || 0) +
      (updateSetExercise.estimated_calories_burned || 0)
    set.total_calories = new_total_calories

    const updateItem: any = {
      ...set_exercise_existed,
      ...updateSetExercise
    }
    if (updateSetExercise?.exercise_id) {
      updateItem.exercise_id = new ObjectId(updateSetExercise.exercise_id)
    }

    set.set_exercises[index] = {
      ...updateItem
    }
    const result = await databaseService.sets.findOneAndUpdate(
      {
        _id: new ObjectId(setId)
      },
      {
        $set: {
          ...omit(set, ['created_at', 'updated_at'])
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  }
  async delete({ id, setId, user_id, role }: { id: string; setId: string; user_id: string; role: UserRole }) {
    const set = await databaseService.sets.findOne({ _id: new ObjectId(setId) })
    if (!set) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: SETS_MESSAGES.SET_NOT_FOUND })
    }

    if (
      (role === UserRole.Admin && set?.user_id) ||
      (role === UserRole.User && !set?.user_id) ||
      (role === UserRole.User && set?.user_id && set?.user_id?.toString() !== user_id)
    ) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: SETS_MESSAGES.NO_DELETE_PERMISSION })
    }

    const set_exercise_existed = set.set_exercises.find((item: SetExercises) => item._id?.toString() === id)
    if (!set_exercise_existed) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SET_EXERCISE_MESSAGES.SET_EXERCISE_NOT_FOUND
      })
    }

    const result = await databaseService.sets.updateOne(
      { _id: new ObjectId(setId) },
      {
        $pull: {
          set_exercises: {
            _id: new ObjectId(id)
          }
        },
        $inc: {
          number_of_exercises: -1,
          total_calories: -(set_exercise_existed.estimated_calories_burned || 0)
        }
      }
    )
    return result
  }
}
const setExerciseService = new SetExerciseService()
export default setExerciseService
