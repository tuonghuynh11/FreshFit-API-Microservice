import { Filter, ObjectId } from 'mongodb'
import databaseService from './database.services'
import { PaymentMethod, TransactionStatus, TransactionType, UserRole } from '~/constants/enums'
import { TRANSACTION_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { TransactionReqBody } from '~/models/requests/Transaction.requests'
import { envConfig } from '~/constants/config'
import { HmacSHA256 } from 'crypto-js'
import axios from 'axios'
import moment from 'moment'
import Transaction from '~/models/schemas/Transactions.schema'
import { Request } from 'express'
import qs from 'qs'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
class TransactionService {
  async getAllByUserId({ page, limit, userId }: { page?: number; limit?: number; userId?: string }) {
    const isUserExisted = await databaseService.users.findOne({ _id: new ObjectId(userId) })
    if (!isUserExisted) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_IS_NOT_EXISTED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const conditions: Filter<Transaction> = {
      userId: new ObjectId(userId)
    }

    const [transactions, total, totalAmountResult] = await Promise.all([
      databaseService.transactions
        .find(conditions, {
          skip: page && limit ? (page - 1) * limit : undefined,
          limit: limit,
          sort: {
            created_at: -1
          }
        })
        .toArray(),
      await databaseService.transactions.countDocuments(conditions),
      databaseService.transactions
        .aggregate([{ $match: conditions }, { $group: { _id: null, totalAmount: { $sum: '$amount' } } }])
        .toArray()
    ])
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0
    return { transactions, total, totalAmount }
  }
  async getById({ id, user_id, role }: { id: string; user_id?: string; role: UserRole }) {
    const transaction = await databaseService.transactions.findOne({
      _id: new ObjectId(id)
    })
    if (!transaction) {
      throw new ErrorWithStatus({
        message: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (transaction.userId.toString() !== user_id) {
      throw new ErrorWithStatus({
        message: TRANSACTION_MESSAGES.NO_GET_PERMISSION,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
    return transaction
  }

  async createZaloPayTransaction({ newTransaction }: { newTransaction: TransactionReqBody }) {
    // APP INFO, STK TEST: 4111 1111 1111 1111
    const config = {
      app_id: envConfig.zalo_app_id,
      key1: envConfig.zalo_key_1,
      key2: envConfig.zalo_key_2,
      endpoint: envConfig.zalo_endpoint
    }
    const embed_data = {
      //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
      //Config sau
      redirecturl: envConfig.zalo_redirect_url
    }

    const items: any[] = []
    const transID = Math.floor(Math.random() * 1000000)

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: envConfig.zalo_app_user,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: newTransaction.amount,
      //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
      //Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
      callback_url: `${envConfig.host}/api/v1/transaction/deposit/zalo-pay/callback`,
      description: `Payment for the order #${transID}`,
      bank_code: '',
      mac: ''
    }

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data: any =
      config.app_id +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item
    order.mac = HmacSHA256(data, config.key1).toString()
    console.log('In Here')
    const response = await axios.post(config.endpoint, null, {
      params: order
    })

    const transaction = new Transaction({
      ...newTransaction,
      paymentMethod: PaymentMethod.Zalo_Pay,
      userId: new ObjectId(newTransaction.userId),
      transactionReference: order.app_trans_id
    })

    await databaseService.transactions.insertOne(transaction)

    return {
      depositTransactionReference: order.app_trans_id,
      result: response.data
    }
  }

  async zaloPayTransactionCallback({ req }: { req: Request }) {
    const result: any = {}
    console.log(req.body)

    const dataStr = req.body.data
    const reqMac = req.body.mac
    const dataJson = JSON.parse(dataStr, envConfig.zalo_key_2 as any)

    try {
      console.log('callback: ')

      const mac = HmacSHA256(dataStr, envConfig.zalo_key_2).toString()
      console.log('mac =', mac)

      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1
        result.return_message = 'mac not equal'
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng ở đây
        console.log("update transaction's status = success where transactionReference =", dataJson['app_trans_id'])

        await databaseService.transactions.updateOne(
          {
            transactionReference: dataJson['app_trans_id']
          },
          {
            $set: {
              status: TransactionStatus.Completed
            }
          }
        )

        result.return_code = 1
        result.return_message = 'success'
        return req.body
      }
    } catch (error: any) {
      result.return_code = 0 // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = error.message
      await databaseService.transactions.updateOne(
        {
          transactionReference: dataJson['app_trans_id']
        },
        {
          $set: {
            status: TransactionStatus.Failed
          }
        }
      )
      console.log(`problem with request: ${error.message}`)
      throw new Error(error)
    }
  }

  async checkZaloPayTransactionStatus({ transactionReference }: { transactionReference: string }) {
    const postData: any = {
      app_id: envConfig.zalo_app_id,
      app_trans_id: transactionReference // Input your app_trans_id
    }

    const data = postData.app_id + '|' + postData.app_trans_id + '|' + envConfig.zalo_key_1 // appid|app_trans_id|key1
    postData.mac = HmacSHA256(data, envConfig.zalo_key_1).toString()

    const postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(postData)
    }

    const result = await axios(postConfig)
    console.log(result.data)
    return result.data
    /**
         * kết quả mẫu
          {
            "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
            "return_message": "",
            "sub_return_code": 1,
            "sub_return_message": "",
            "is_processing": false,
            "amount": 50000,
            "zp_trans_id": 240331000000175,
            "server_time": 1711857138483,
            "discount_amount": 0
          }
        */
  }
  async updateStatus({ id, status }: { id: string; status: TransactionStatus }) {
    const transaction = await databaseService.transactions.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after' // Trả về giá trị mới
      }
    )

    return transaction
  }
  async refundForUser({ userId, refundAmount }: { userId: string; refundAmount: number }) {
    const newTransaction = new Transaction({
      userId: new ObjectId(userId),
      amount: refundAmount,
      status: TransactionStatus.Completed,
      type: TransactionType.Refunded,
      paymentMethod: undefined,
      transactionReference: undefined
    })
    await databaseService.transactions.insertOne(newTransaction)

    return newTransaction
  }
  async makeBookingTrans({ userId, amount }: { userId: string; amount: number }) {
    const newTransaction = new Transaction({
      userId: new ObjectId(userId),
      amount,
      status: TransactionStatus.Completed,
      type: TransactionType.Booking,
      paymentMethod: undefined,
      transactionReference: undefined
    })
    await databaseService.transactions.insertOne(newTransaction)

    return newTransaction
  }
}
const transactionService = new TransactionService()
export default transactionService
