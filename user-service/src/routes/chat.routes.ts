import { Router } from 'express'
import {
  addChatRoomController,
  deleteChatRoomController,
  getAllChatRoomController,
  getMessagesInChatRoomController,
  sendMessageController
} from '~/controllers/chats.controllers'
import { sendMessageValidator } from '~/middlewares/chats.middlewares'
import { paginationNavigator } from '~/middlewares/paginations.middlewares'
import { accessTokenValidator, adminRoleValidator, verifiedUSerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handles'
// Base route: /chats
const chatsRouter = Router()

/**
 * Description: Get Messages in chat room
 * Path: /:chat_room_id/messages?page = 1 &limit = 10
 * Method: GET
 * **/
chatsRouter.get(
  '/:chat_room_id/messages',
  accessTokenValidator,
  paginationNavigator,
  wrapRequestHandler(getMessagesInChatRoomController)
)

/**
 * Description: Get all chat room
 * Path: /chat-room?page = 1 &limit = 10
 * Method: Get
 * Body:
 * **/
chatsRouter.get(
  '/chat-room',
  accessTokenValidator,
  verifiedUSerValidator,
  paginationNavigator,
  wrapRequestHandler(getAllChatRoomController)
)

/**
 * Description: Create chat room
 * Path: /chat-room
 * Method: Post
 * Body: {
 * user1: string
 * user2: string
 * }
 * **/
chatsRouter.post('/chat-room', accessTokenValidator, verifiedUSerValidator, wrapRequestHandler(addChatRoomController))

/**
 * Description: Delete chat room
 * Path: /:chat_room_id
 * Method: Delete
 * Body: {
 * user1: string
 * user2: string
 * }
 * **/
chatsRouter.delete(
  '/:chat_room_id',
  accessTokenValidator,
  verifiedUSerValidator,
  adminRoleValidator,
  wrapRequestHandler(deleteChatRoomController)
)

/**
 * Description: Send message
 * Path: /:chat_room_id
 * Method: Post
 * Body: {
 * message: string
 * image: string?
 * }
 * **/
chatsRouter.post(
  '/:chat_room_id',
  accessTokenValidator,
  verifiedUSerValidator,
  sendMessageValidator,
  wrapRequestHandler(sendMessageController)
)

/**
 * Description: Update ingredient
 * Path: /:id
 * Method: Patch
 * Body: {
 * name: string
 * description: string
 * calories: number
 * image: string
 * cab?: number
 * sodium?: number
 * sugar?: number
 * cholesterol?: number
 * fat?: number
 * protein?: number
 * }
 * **/
// chatsRouter.patch(
//   '/:id',
//   accessTokenValidator,
//   verifiedUSerValidator,
//   adminRoleValidator,
//   updateIngredientValidator,
//   filterMiddleware<UpdateIngredientReqBody>([
//     'name',
//     'description',
//     'calories',
//     'image',
//     'cab',
//     'sodium',
//     'sugar',
//     'cholesterol',
//     'fat',
//     'protein'
//   ]),
//   wrapRequestHandler(updateIngredientController)
// )

// /**
//  * Description: Delete Ingredient
//  * Path:/:id
//  * Method: Delete
//  * Body:
//  * **/
// chatsRouter.delete(
//   '/:id',
//   accessTokenValidator,
//   verifiedUSerValidator,
//   adminRoleValidator,
//   wrapRequestHandler(deleteIngredientController)
// )

export default chatsRouter
