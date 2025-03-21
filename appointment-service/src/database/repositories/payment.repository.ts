import { Request } from "express";
import PaymentService from "../../services/payment";

export default class PaymentRepository {
  static payByMomo = async (req: Request) => {
    const { orderId, amount } = req.body;
    const { dataSource } = req.app.locals;
    // const orderRepository = dataSource.getRepository(Order);
    const orderRepository: any = "";

    const order = await orderRepository.findOneBy({
      id: orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const { orderPaymentId, result } = await PaymentService.payByMomo({
      orderAmount: amount,
    });
    order.orderPaymentId = orderPaymentId;

    await orderRepository.save(order);
    return result;
  };
  static momoPaymentCheckTransactionStatus = async (req: Request) => {
    const { orderPaymentId } = req.body;

    return await PaymentService.momoPaymentCheckTransactionStatus({
      orderId: orderPaymentId,
    });
  };

  static payByZaloPay = async (req: Request) => {
    const { orderId, amount } = req.body;
    const { dataSource } = req.app.locals;
    const orderRepository: any = "";

    const order = await orderRepository.findOneBy({
      id: orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const { orderPaymentId, result } = await PaymentService.payByZaloPay({
      orderId,
      orderAmount: amount,
    });
    order.orderPaymentId = orderPaymentId;

    await orderRepository.save(order);
    return result;
  };

  static zaloPayPaymentCheckTransactionStatus = async (req: Request) => {
    const { orderPaymentId } = req.body;

    return await PaymentService.zaloPayPaymentCheckTransactionStatus({
      orderId: orderPaymentId,
    });
  };
}
