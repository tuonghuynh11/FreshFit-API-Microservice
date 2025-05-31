import { Currency, PaymentMethod, TransactionStatus } from '~/constants/enums'

export interface TransactionReqBody {
  userId: string
  amount: number
  currency?: Currency
  payment_method?: PaymentMethod
  transaction_reference?: string
}
export interface UpdateTransactionStatusReqBody {
  status: TransactionStatus
}
