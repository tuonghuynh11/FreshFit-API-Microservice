import { ObjectId } from 'mongodb'
import { Currency, PaymentMethod, TransactionStatus, TransactionType } from '~/constants/enums'

// Swagger UI Express Comment Format

interface TransactionTypeInput {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  currency?: Currency
  paymentMethod?: PaymentMethod
  status?: TransactionStatus
  type?: TransactionType
  transactionReference?: string
  created_at?: Date
  updated_at?: Date
}

export default class Transaction {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  currency?: Currency
  paymentMethod?: PaymentMethod
  status?: TransactionStatus
  type?: TransactionType
  transactionReference?: string
  created_at?: Date
  updated_at?: Date
  constructor(transaction: TransactionTypeInput) {
    const date = new Date()
    this._id = transaction._id
    this.userId = transaction.userId
    this.amount = transaction.amount
    this.currency = transaction.currency || Currency.USD
    this.paymentMethod = transaction.paymentMethod
    this.status = transaction.status || TransactionStatus.Pending
    this.type = transaction.type || TransactionType.Deposit
    this.transactionReference = transaction.transactionReference
    this.created_at = transaction.created_at || date
    this.updated_at = transaction.updated_at || date
  }
}
