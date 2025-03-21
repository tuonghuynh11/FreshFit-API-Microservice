import { NextFunction, Request, Response } from "express";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Post } from "../decorators/handlers";

import PaymentRepository from "../database/repositories/payment.repository";
import configuration from "../configuration";

import { HmacSHA256 } from "crypto-js";
import { Appointment } from "../database/entities/Appointments";
@Controller("/payment")
// @Authenticate()
export default class PaymentController {
  @Post("/momo")
  @Authorize()
  public async momoPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PaymentRepository.payByMomo(req);

      res.locals.message = "Payment success";
      res.locals.data = {
        result,
      };
      next();
    } catch (error: any) {
      console.log(`problem with request: ${error.message}`);
      next(error);
    }
  }
  @Post("/momo/callback")
  public async momoPaymentCallBack(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
    resultCode = 0: giao dịch thành công.
    resultCode = 9000: giao dịch được cấp quyền (authorization) thành công .
    resultCode <> 0: giao dịch thất bại.
   */
      console.log("callback: ");
      console.log(req.body);
      const { resultCode, orderId } = req.body;
      const { dataSource, socket } = req.app.locals;
      const { session } = res.locals;
      const appointmentRepository = dataSource.getRepository(Appointment);

      /**
   * Dựa vào kết quả này để update trạng thái đơn hàng
   * Kết quả log:
   * {
        partnerCode: 'MOMO',
        orderId: 'MOMO1712108682648',
        requestId: 'MOMO1712108682648',
        amount: 10000,
        orderInfo: 'pay with MoMo',
        orderType: 'momo_wallet',
        transId: 4014083433,
        resultCode: 0,
        message: 'Thành công.',
        payType: 'qr',
        responseTime: 1712108811069,
        extraData: '',
        signature: '10398fbe70cd3052f443da99f7c4befbf49ab0d0c6cd7dc14efffd6e09a526c0'
      }
   */
      if (resultCode === 0) {
        // const order = await orderRepository.findOne({
        //   where: {
        //     orderPaymentId: orderId,
        //   },
        // });
        // order!.paymentStatus = PaymentStatus.PAID;
        // await orderRepository.save(order!);
        // const urlOrderDetail = `/shopkeeper/orders/${order?.id}`;
        // await Promise.all([
        //   createNotification({
        //     title: "Order Payment",
        //     contentType: NotificationType.PERSONAL,
        //     assignee: order?.user.id!,
        //     content: `The order ${order?.id} has been paid successfully`,
        //     createdBy: session.userId,
        //     dataSource: dataSource,
        //     socket: socket,
        //     actions: urlOrderDetail,
        //   }),
        //   createNotification({
        //     title: "Order Payment",
        //     contentType: ENotificationType.PERSONAL,
        //     assignee: order?.shop?.owner.id!,
        //     content: `The order ${order?.id} has been paid successfully`,
        //     createdBy: session.userId,
        //     dataSource: dataSource,
        //     socket: socket,
        //     actions: urlOrderDetail,
        //   }),
        // ]);
      }
      res.locals.message = "Payment success";
      res.locals.data = {
        data: req.body,
      };

      next();
    } catch (error: any) {
      console.log(`problem with request: ${error.message}`);
      next(error);
    }
  }
  @Post("/momo/check-status-transaction")
  public async momoPaymentCheckTransactionStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PaymentRepository.momoPaymentCheckTransactionStatus(
        req
      );

      res.locals.data = {
        data: result,
      };

      next();
    } catch (error: any) {
      console.log(`problem with request: ${error.message}`);
      next(error);
    }
  }

  @Post("/zalopay")
  @Authorize()
  public async zaloPayPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PaymentRepository.payByZaloPay(req);
      res.locals.message = "Payment success";
      res.locals.data = {
        result,
      };

      next();
    } catch (error: any) {
      console.log(`problem with request: ${error.message}`);
      next(error);
    }
  }
  @Post("/zalopay/callback")
  public async zaloPayPaymentCallBack(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let result: any = {};
    console.log(req.body);
    try {
      console.log("callback: ");
      const { dataSource, socket } = req.app.locals;
      const { session } = res.locals;

      // const orderRepository = dataSource.getRepository(Order);

      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = HmacSHA256(dataStr, configuration.zalo_key_2).toString();
      console.log("mac =", mac);

      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng ở đây
        let dataJson = JSON.parse(dataStr, configuration.zalo_key_2 as any);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson["app_trans_id"]
        );
        // const order = await orderRepository.findOne({
        //   relations: {
        //     user: true,
        //     shop: {
        //       owner: true,
        //     },
        //   },
        //   where: {
        //     orderPaymentId: dataJson["app_trans_id"],
        //   },
        // });
        // order!.paymentStatus = PaymentStatus.PAID;
        // await orderRepository.save(order!);

        // const urlOrderDetail = `/shopkeeper/orders/${order?.id}`;

        // await Promise.all([
        //   createNotification({
        //     title: "Order Payment",
        //     contentType: NotificationType.PERSONAL,
        //     assignee: order?.user?.id!,
        //     content: `The order ${order?.id} has been paid successfully`,
        //     createdBy: order?.user?.id!,
        //     dataSource: dataSource,
        //     socket: socket,
        //     actions: urlOrderDetail,
        //   }),
        //   createNotification({
        //     title: "Order Payment",
        //     contentType: NotificationType.PERSONAL,
        //     assignee: order?.shop?.owner.id!,
        //     content: `The order ${order?.id} has been paid successfully`,
        //     createdBy: order?.shop?.owner.id!,
        //     dataSource: dataSource,
        //     socket: socket,
        //     actions: urlOrderDetail,
        //   }),
        // ]);

        result.return_code = 1;
        result.return_message = "success";
        res.locals.message = "Payment success";
        res.locals.data = {
          data: req.body,
        };

        next();
      }
    } catch (error: any) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = error.message;
      console.log(`problem with request: ${error.message}`);
      next(error);
    }
  }

  @Post("/zalopay/check-status-transaction")
  public async zaloPayPaymentCheckTransactionStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result =
        await PaymentRepository.zaloPayPaymentCheckTransactionStatus(req);

      res.locals.data = {
        data: result,
      };

      next();
    } catch (error: any) {
      console.log(`problem with request: ${error.message}`);
      next(error);
    }
  }
}
