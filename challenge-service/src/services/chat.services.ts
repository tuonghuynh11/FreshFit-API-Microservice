import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { UserRole } from '~/constants/enums'
import { CHAT_MESSAGES, DISH_MESSAGES, EXERCISE_MESSAGES, REPORT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { DishIngredientReqBody, UpdateDishReqBody } from '~/models/requests/Dishes.requests'
import DishesIngredients from '~/models/schemas/DishesIngredients.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MessageReqBody } from '~/models/requests/Chat.requests'
import ChatDetail from '~/models/schemas/ChatDetail.schema'
import ChatRoom from '~/models/schemas/ChatRoom.schema'
import { omit } from 'lodash'

class ChatService {
  async getMessagesInChatRoom({
    chat_room_id,
    page,
    limit,
    sort_by = 'created_at',
    order_by = 'DESC'
  }: {
    chat_room_id: string
    page: number
    limit: number
    sort_by?: string
    order_by?: string
  }) {
    console.log('Page: ', page)
    console.log('Limit: ', limit)

    const chatRoom = await databaseService.chatRooms.findOne({ _id: new ObjectId(chat_room_id) })
    if (!chatRoom) {
      throw new ErrorWithStatus({
        message: CHAT_MESSAGES.CHAT_ROOM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const conditions: any = {
      _id: {
        $in: chatRoom.chatDetails
      }
    }

    const [messages] = await Promise.all([databaseService.chatDetails.find(conditions).toArray()])
    messages.sort((a: ChatDetail, b: ChatDetail) => b.updated_at!.getTime() - a.updated_at!.getTime())
    const result = messages.slice((page - 1) * limit, page * limit)

    return {
      messages: result,
      total: messages.length
    }
  }
  async getAllChatRoom({
    user_id,
    page,
    limit,
    sort_by = 'updated_at',
    order_by = 'DESC'
  }: {
    user_id: string
    page?: number
    limit?: number
    sort_by?: string
    order_by?: string
  }) {
    const conditions: any = {
      $or: [
        {
          user_1: new ObjectId(user_id)
        },
        {
          user_2: new ObjectId(user_id)
        }
      ]
    }

    const [chatRooms, total] = await Promise.all([
      databaseService.chatRooms
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            [sort_by]: order_by === 'ASC' ? 1 : -1
          }
        })
        .toArray(),
      await databaseService.reports.countDocuments(conditions)
    ])

    const lastMessages = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        if (chatRoom.chatDetails.length == 0) {
          return null
        }
        const lastMessage = await databaseService.chatDetails.findOne({
          _id: chatRoom.chatDetails[chatRoom.chatDetails.length - 1]
        })
        return lastMessage
      })
    )

    const result = chatRooms.map((chatRoom, index) => {
      return {
        ...chatRoom,
        lastMessage: lastMessages[index]
      }
    })

    return {
      chat_rooms: result.map((item) => ({
        ...omit(item, ['chatDetails'])
      })),
      total
    }
  }

  async getById({ id, user_id, role }: { id: string; user_id: string; role: UserRole }) {
    const report = await databaseService.reports.findOne({
      _id: new ObjectId(id)
    })
    if (!report) {
      throw new ErrorWithStatus({
        message: REPORT_MESSAGES.REPORT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const reporter = await databaseService.users.findOne(
      {
        _id: report.from
      },
      {
        projection: {
          _id: 1,
          fullName: 1,
          email: 1,
          username: 1,
          avatar: 1,
          verify: 1
        }
      }
    )
    return {
      ...report,
      from: reporter
    }
  }

  async add({ user_id }: { user_id: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const admin = await databaseService.users.findOne({
      role: UserRole.Admin
    })

    const chatRoom = await databaseService.chatRooms.findOne({
      $or: [
        {
          user_1: new ObjectId(user_id),
          user_2: new ObjectId(admin!._id)
        },
        {
          user_1: new ObjectId(admin!._id),
          user_2: new ObjectId(user_id)
        }
      ]
    })

    if (chatRoom) {
      return chatRoom
    }

    const newChatRoom = new ChatRoom({
      user_1: new ObjectId(user_id),
      user_2: new ObjectId(admin!._id),
      title: `${user.fullName} - ${admin!.fullName}`
    })

    const insertedChatRoom = await databaseService.chatRooms.insertOne(newChatRoom)

    return {
      ...newChatRoom,
      _id: insertedChatRoom.insertedId
    }
  }
  async update({ id, updateDish }: { id: string; updateDish: UpdateDishReqBody }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.dishes.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...updateDish
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return result
  }

  async delete({ id }: { id: string }) {
    const exercise = await databaseService.exercises.findOne({ _id: new ObjectId(id) })
    if (!exercise) {
      throw new Error(EXERCISE_MESSAGES.EXERCISE_NOT_FOUND)
    }

    const isUsedBySetExercise = await databaseService.set_exercises
      .find({
        exercises: {
          _id: new ObjectId(id)
        }
      })
      .toArray()

    if (isUsedBySetExercise.length > 0) {
      throw new Error(EXERCISE_MESSAGES.EXERCISE_IS_USED)
    }

    const result = await databaseService.exercises.deleteOne({ _id: new ObjectId(id) })

    return result
  }

  async addDishIngredient({ id, dishIngredient }: { id: string; dishIngredient: DishIngredientReqBody }) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(id) })
    if (!dish) {
      throw new ErrorWithStatus({
        message: DISH_MESSAGES.DISH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.dishes.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $push: {
          ingredients: new DishesIngredients({
            _id: new ObjectId(),
            ingredientId: dishIngredient.ingredientId,
            quantity: dishIngredient.quantity,
            unit: dishIngredient.unit
          })
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return result
  }
  async sendMessage({ user_id, chat_room_id, body }: { user_id: string; chat_room_id: string; body: MessageReqBody }) {
    const chatRoom = await databaseService.chatRooms.findOne({ _id: new ObjectId(chat_room_id) })
    if (!chatRoom) {
      throw new ErrorWithStatus({
        message: CHAT_MESSAGES.CHAT_ROOM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const message = new ChatDetail({
      sender: new ObjectId(user_id),
      message: body.message,
      image: body.image
    })

    const newMessage = await databaseService.chatDetails.insertOne(message)

    await databaseService.chatRooms.findOneAndUpdate(
      {
        _id: new ObjectId(chat_room_id)
      },
      {
        $push: {
          chatDetails: newMessage.insertedId
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return {
      ...newMessage,
      _id: newMessage.insertedId
    }
  }
  async deleteChatRoom({ chat_room_id }: { chat_room_id: string }) {
    const chatRoom = await databaseService.chatRooms.findOne({ _id: new ObjectId(chat_room_id) })
    if (!chatRoom) {
      throw new ErrorWithStatus({
        message: CHAT_MESSAGES.CHAT_ROOM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const chatDetailsId = chatRoom.chatDetails.map((item) => item)

    await databaseService.chatDetails.deleteMany({
      _id: {
        $in: chatDetailsId
      }
    })

    await databaseService.chatRooms.deleteOne({ _id: new ObjectId(chat_room_id) })

    return true
  }
}
const chatService = new ChatService()
export default chatService
