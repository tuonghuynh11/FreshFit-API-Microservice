import axios from "axios";
import configuration from "../configuration";
import { CreateNotificationReqBody } from "../database/requests/notification.requests";

const USER_ENDPOINT = "users";
const TRANSACTION_ENDPOINT = "transactions";
const NOTIFICATION_ENDPOINT = "notifications";
export default class UserService {
  static checkUserExisted = async ({ userId }: { userId: string }) => {
    const res = await axios.get(
      `${configuration.userServiceHost}/${USER_ENDPOINT}/exist/${userId}`
    );
    return res.data.result;
  };
  static makeBookingTransaction = async ({
    userId,
    amount,
  }: {
    userId: string;
    amount: number;
  }) => {
    const res = await axios.post(
      `${configuration.userServiceHost}/${TRANSACTION_ENDPOINT}/book/${userId}`,
      {
        amount,
      }
    );
    return res.data.transaction;
  };
  static makeRefundTransaction = async ({
    userId,
    amount,
  }: {
    userId: string;
    amount: number;
  }) => {
    const res = await axios.post(
      `${configuration.userServiceHost}/${TRANSACTION_ENDPOINT}/refund/${userId}/system`,
      {
        refundAmount: amount,
      }
    );
    return res.data.transaction;
  };
  static createNotification = async (data: CreateNotificationReqBody) => {
    const res = await axios.post(
      `${configuration.userServiceHost}/${NOTIFICATION_ENDPOINT}/users/${data.userId}`,
      data
    );
    return res.data.result;
  };
}
