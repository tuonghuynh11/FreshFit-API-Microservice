import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { RoleTypeQueryFilter, UserRole } from '~/constants/enums'
import { SETS_MESSAGES } from '~/constants/messages'
import { SetReqBody, UpdateSetReqBody } from '~/models/requests/Set.requests'
import Sets from '~/models/schemas/Sets.schema'
import { SetExerciseReqBody } from '~/models/requests/SetExercise.requests'
import SetExercises from '~/models/schemas/SetExercises.schema'
import { omit } from 'lodash'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

class SetService {
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

  async getById({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const set = await databaseService.sets.findOne({
      _id: new ObjectId(id)
    })
    if (!set) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: SETS_MESSAGES.SET_NOT_FOUND })
    }
    // if (
    //   (role === UserRole.Admin && set?.user_id) ||
    //   (role === UserRole.User && !set?.user_id) ||
    //   (role === UserRole.User && set?.user_id && set?.user_id?.toString() !== user_id)
    // ) {
    //   throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: SETS_MESSAGES.NO_DELETE_PERMISSION })
    // }

    // Sort ascending set_exercises by order
    set.set_exercises = set.set_exercises.sort((a: SetExercises, b: SetExercises) => a.orderNumber! - b.orderNumber!)

    // Get all exercises by set_exercises
    const exercisesList = await Promise.all(
      set.set_exercises.map((set_exercise: SetExercises) => {
        return databaseService.exercises.findOne({ _id: new ObjectId(set_exercise.exercise_id) })
      })
    )
    set.set_exercises = set.set_exercises.map((set_exercise: SetExercises, index: number) => {
      return {
        ...set_exercise,
        exercise: exercisesList[index]
      }
    })
    return set
  }

  async add({ set, user_id, role }: { set: SetReqBody; user_id: string; role: UserRole }) {
    const format_set_exercises: SetExercises[] = set.set_exercises.map((set_exercise: SetExerciseReqBody) => {
      return new SetExercises({
        ...set_exercise
      })
    })

    // const set_exercises_inserted = await databaseService.set_exercises.insertMany(format_set_exercises)

    const newSet = new Sets({
      ...set,
      user_id: role === UserRole.Admin ? undefined : new ObjectId(user_id),
      set_exercises: format_set_exercises.map((set_exercise: SetExercises, index: number) => {
        return {
          ...set_exercise,
          // _id: set_exercises_inserted.insertedIds[index]
          _id: new ObjectId()
        }
      })
    })
    const setInserted = await databaseService.sets.insertOne(newSet)
    return {
      ...newSet,
      _id: setInserted.insertedId
    }
  }
  async update({ id, updateSet }: { id: string; updateSet: UpdateSetReqBody }) {
    const set = await databaseService.sets.findOne({ _id: new ObjectId(id) })
    if (!set) {
      throw new Error(SETS_MESSAGES.SET_NOT_FOUND)
    }

    const updateData: any = {
      ...omit(updateSet, ['set_exercises'])
    }
    // if (updateSet?.set_exercises) {
    //   updateData.set_exercises = updateSet.set_exercises.map((set_exercise: SetExerciseUpdateReqBody) => {
    //     return new SetExercises({
    //       ...set_exercise,
    //       _id: new ObjectId(set_exercise._id)
    //     })
    //   })
    //   const deleteSetExercises = set.set_exercises.filter(
    //     (item: SetExercises) =>
    //       !updateSet.set_exercises?.find(
    //         (set_exercise: SetExerciseUpdateReqBody) => set_exercise._id === item._id?.toString()
    //       )
    //   )
    //   const deleteSetExerciseIds = deleteSetExercises.map(
    //     (set_exercise: SetExercises) => new ObjectId(set_exercise._id)
    //   )
    //   await databaseService.set_exercises.deleteMany({
    //     _id: {
    //       $in: deleteSetExerciseIds
    //     }
    //   })

    //   await Promise.all(
    //     updateData.set_exercises.map(async (set_exercise: SetExercises) => {
    //       if (set_exercise._id) {
    //         await databaseService.set_exercises.findOneAndUpdate(
    //           {
    //             _id: new ObjectId(set_exercise._id)
    //           },
    //           {
    //             $set: {
    //               ...set_exercise
    //             }
    //           }
    //         )
    //       } else {
    //         const set_exercise_inserted = await databaseService.set_exercises.insertOne(set_exercise)
    //         set_exercise._id = set_exercise_inserted.insertedId
    //       }
    //     })
    //   )
    // }
    // const result = await databaseService.sets.findOneAndUpdate(
    //   {
    //     _id: new ObjectId(id)
    //   },
    //   {
    //     $set: {
    //       ...updateData
    //     },
    //     $currentDate: {
    //       updated_at: true
    //     }
    //   },
    //   {
    //     returnDocument: 'after' // Trả về giá trị mới
    //   }
    // )

    const result = await databaseService.sets.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateData
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
  async delete({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const set = await databaseService.sets.findOne({ _id: new ObjectId(id) })
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

    const isUsedByWorkoutPlanDetails = await databaseService.workoutPlanDetails
      .find({
        sets: {
          $elemMatch: {
            set_id: new ObjectId(id)
          }
        }
      })
      .toArray()

    if (isUsedByWorkoutPlanDetails.length > 0) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.CONFLICT, message: SETS_MESSAGES.SET_IS_USED })
    }

    const result = await databaseService.sets.deleteOne({ _id: new ObjectId(id) })
    return result
  }
  async clone({ user_id, set_ids, role }: { user_id: string; role: UserRole; set_ids: string[] }) {
    const sets = await databaseService.sets
      .find({
        _id: {
          $in: set_ids.map((set_id) => new ObjectId(set_id))
        }
      })
      .toArray()
    const newSets = sets.map((set: Sets) => {
      return new Sets({
        ...omit(set, ['_id', 'user_id']),
        user_id: new ObjectId(user_id)
      })
    })
    const { insertedIds, insertedCount } = await databaseService.sets.insertMany(newSets)
    const newSetIds: ObjectId[] = Object.values(insertedIds).map((id) => new ObjectId(id))

    newSets.forEach((set, index) => {
      set._id = newSetIds[index]
    })
    return newSets
  }
  async rating({ id, value }: { id: string; value: number }) {
    const set = await databaseService.sets.findOne({
      _id: new ObjectId(id)
    })
    if (!set) {
      throw new ErrorWithStatus({
        message: SETS_MESSAGES.SET_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (set.user_id != null) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: SETS_MESSAGES.NO_RATING_PERMISSION })
    }
    await databaseService.sets.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          rating: Number(((set.rating! + value) / 2).toFixed(1))
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
}
const setService = new SetService()
export default setService
