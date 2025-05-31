import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { CHAT_MESSAGES, DISH_MESSAGES, REPORT_MESSAGES } from '~/constants/messages'
import dishService from '~/services/dishes.services'
import reportService from '~/services/reports.services'
import { MessageReqBody } from '~/models/requests/Chat.requests'
import chatService from '~/services/chat.services'

export const getMessagesInChatRoomController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { page, limit } = req.query
  const { chat_room_id } = req.params
  const { messages, total } = await chatService.getMessagesInChatRoom({
    chat_room_id,
    page,
    limit
  })
  return res.json({
    message: CHAT_MESSAGES.GET_CHAT_MESSAGES_SUCCESS,
    result: {
      messages,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}
export const getAllChatRoomController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const { page, limit } = req.query
  const { chat_rooms, total } = await chatService.getAllChatRoom({
    user_id,
    page,
    limit
  })
  return res.json({
    message: CHAT_MESSAGES.GET_ALL_CHAT_ROOM_SUCCESS,
    result: {
      chat_rooms,
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const addChatRoomController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const result = await chatService.add({ user_id })

  return res.json({
    message: CHAT_MESSAGES.CREATE_CHAT_ROOM_SUCCESS,
    chatRoom: result
  })
}

export const sendMessageController = async (req: Request<ParamsDictionary, any, MessageReqBody>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { chat_room_id } = req.params
  const result = await chatService.sendMessage({ user_id, chat_room_id, body: req.body })

  return res.json({
    message: CHAT_MESSAGES.SEND_MESSAGE_SUCCESS,
    result
  })
}

export const ratingDishController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params
  const { value } = req.body
  const result = await dishService.rating({ id, value: Number(value) })

  return res.json({
    message: DISH_MESSAGES.RATING_SUCCESS
  })
}
export const getReportByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const result = await reportService.getById({ id, user_id, role })

  return res.json({
    message: REPORT_MESSAGES.GET_REPORT_SUCCESS,
    report: result
  })
}
export const deleteChatRoomController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { chat_room_id } = req.params

  const result = await chatService.deleteChatRoom({ chat_room_id: chat_room_id as string })

  return res.json({
    message: CHAT_MESSAGES.DELETE_CHAT_ROOM_SUCCESS
  })
}
