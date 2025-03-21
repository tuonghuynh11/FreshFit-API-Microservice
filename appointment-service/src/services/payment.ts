import configuration from "../configuration";
import axios from "axios";
import crypto from "crypto";
import { HmacSHA256 } from "crypto-js";
import moment from "moment";
import qs from "qs";
export default class PaymentService {
  static payByMomo = async ({ orderAmount }: { orderAmount: number }) => {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    const accessKey = configuration.momo_access_key;
    const secretKey = configuration.momo_secret_key;
    const partnerCode = configuration.momo_partner_code;
    const redirectUrl = configuration.momo_redirect_url;
    const ipnUrl = `${configuration.serverSite}/api/v1/payment/momo/callback`;
    const requestType = configuration.momo_request_type;
    const amount = orderAmount.toString();
    const orderExpireTime = configuration.momo_order_expire_time;
    const orderId = partnerCode + new Date().getTime();
    const orderInfo = `Pay for the order ${orderId}`;
    const requestId = orderId;
    const extraData = "";
    const paymentCode = configuration.momo_payment_code;
    const orderGroupId = "";
    const autoCapture = configuration.momo_auto_capture;
    const lang = configuration.momo_language;

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);
    //signature
    const crypto = require("crypto");
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
      orderExpireTime: orderExpireTime,
    });
    //Optional Axios
    const options = {
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };
    const response = await axios(options);
    console.log(`Status: ${response.data}`);

    return {
      orderPaymentId: orderId,
      result: response.data,
    };
  };
  static momoPaymentCheckTransactionStatus = async ({
    orderId,
  }: {
    orderId: string;
  }) => {
    const secretKey = configuration.momo_secret_key;
    const accessKey = configuration.momo_access_key;
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode: "MOMO",
      requestId: orderId,
      orderId: orderId,
      signature: signature,
      lang: "vi",
    });

    // options for axios
    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/query",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    };

    const result = await axios(options);

    return result.data;
  };

  static payByZaloPay = async ({
    orderId,
    orderAmount,
  }: {
    orderId: string;
    orderAmount: number;
  }) => {
    // APP INFO, STK TEST: 4111 1111 1111 1111
    const config = {
      app_id: configuration.zalo_app_id,
      key1: configuration.zalo_key_1,
      key2: configuration.zalo_key_2,
      endpoint: configuration.zalo_endpoint,
    };
    const embed_data = {
      //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
      redirecturl: configuration.zalo_redirect_url,
    };

    const items: any[] = [];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: configuration.zalo_app_user,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderAmount,
      //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
      //Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
      callback_url: `${configuration.serverSite}/api/v1/payment/zalopay/callback`,
      description: `Payment for the order #${transID}`,
      bank_code: "",
      mac: "",
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data: any =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = HmacSHA256(data, config.key1).toString();
    console.log("In Here");
    const response = await axios.post(config.endpoint, null, {
      params: order,
    });

    return {
      orderPaymentId: order.app_trans_id,
      result: response.data,
    };
  };

  static zaloPayPaymentCheckTransactionStatus = async ({
    orderId,
  }: {
    orderId: string;
  }) => {
    let postData: any = {
      app_id: configuration.zalo_app_id,
      app_trans_id: orderId, // Input your app_trans_id
    };

    let data =
      postData.app_id +
      "|" +
      postData.app_trans_id +
      "|" +
      configuration.zalo_key_1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(
      data,
      configuration.zalo_key_1
    ).toString();

    let postConfig = {
      method: "post",
      url: "https://sb-openapi.zalopay.vn/v2/query",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };

    const result = await axios(postConfig);
    console.log(result.data);
    return result.data;
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
  };
}
