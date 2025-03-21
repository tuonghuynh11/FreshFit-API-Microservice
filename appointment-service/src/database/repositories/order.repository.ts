import { Request, Response } from "express";
import { OrderStatus } from "../../utils/enums";

// export default class OrderRepository {
//   static getOrderById = async ({
//     req,
//     res,
//   }: {
//     req: Request;
//     res: Response;
//   }) => {
//     const { id } = req.params;
//     const { session } = res.locals;
//     const { dataSource } = req.app.locals;
//     const orderRepository = dataSource.getRepository(Order);

//     const order: Order | null = await orderRepository.findOne({
//       relations: [
//         "paymentMethod",
//         "shippingMethod",
//         "address",
//         "discount",
//         "shop",
//         "orderDetails",
//         "orderDetails.product",
//         "orderDetails.product.shop",
//         "orderDetails.product.shop.owner",
//         "orderDetails.product.images",
//         "orderDetails.product.categories",
//       ],
//       where: {
//         id,
//       },
//     });
//     if (!order) {
//       throw new NotAcceptableError("Order not found");
//     }
//     if (session.role === SystemRole.Shopkeeper) {
//       const isOwnerOfOrder = order.orderDetails.filter(
//         (orderDetail: OrderDetail) => {
//           return orderDetail.product.shop?.owner?.id === session.userId;
//         }
//       );
//       if (isOwnerOfOrder.length === 0) {
//         throw new NotAcceptableError("You are not owner of this order");
//       }
//     }

//     const formatData = {
//       ...omit(order, [
//         "paymentMethod",
//         "shippingMethod",
//         "discount",
//         "orderDetails",
//       ]),
//       shop: {
//         id: order.shop?.id,
//         name: order.shop?.name,
//         description: order.shop?.description,
//         image: order.shop?.image,
//         status: order.shop?.status,
//       },
//       paymentMethod: order.paymentMethod?.name,
//       shippingMethod: {
//         name: order.shippingMethod?.name,
//         type: order.shippingMethod?.type,
//       },
//       discount: {
//         id: order.discount?.id,
//         description: order.discount?.description,
//         discountPercentage: order.discount?.discountPercentage,
//       },
//       orderDetails: order.orderDetails.map((orderDetail: OrderDetail) => ({
//         ...omit(orderDetail, ["product"]),
//         product: {
//           ...omit(orderDetail.product, [
//             "shop",
//             "images",
//             "categories",
//             "createdBy",
//             "createdAt",
//             "updatedAt",
//             "updatedBy",
//             "deletedAt",
//             "deletedBy",
//           ]),
//           images: orderDetail.product?.images.map((image) => image.imageUrl),
//           categories: orderDetail.product.categories.map((category) => ({
//             id: category.id,
//             name: category.name,
//             image: category.image,
//             description: category.description,
//           })),
//         },
//       })),
//     };

//     return formatData;
//   };
//   static getListOrder = async ({
//     req,
//     res,
//   }: {
//     req: Request;
//     res: Response;
//   }) => {
//     const { session } = res.locals;
//     const { dataSource } = req.app.locals;
//     const orderRepository = dataSource.getRepository(Order);

//     const { pageSize = 100, pageIndex = 1, status, searchName } = req.query;

//     const conditions = {
//       orderStatus: status
//         ? OrderStatus[status as keyof typeof OrderStatus]
//         : undefined,
//       id: searchName ? Like(`%${searchName}%`) : undefined,
//       shop: {
//         owner: {
//           id: session.userId,
//         },
//       },
//     };
//     const orders = await orderRepository.find({
//       skip: Number(pageSize) * (Number(pageIndex) - 1),
//       take: Number(pageSize),
//       relations: {
//         shop: {
//           owner: true,
//         },
//         user: true,
//       },
//       where: conditions,
//     });

//     const count = await orderRepository.count({
//       where: conditions,
//     });

//     return {
//       pageSize: Number(pageSize),
//       pageIndex: Number(pageIndex),
//       count,
//       totalPages: Math.ceil(count / Number(pageSize)),
//       orders: orders.map((order: Order) => {
//         return {
//           ...omit(order, ["shop"]),
//           user: {
//             ...omit(order.user, [
//               "hashPassword",
//               "role",
//               "createdAt",
//               "updatedAt",
//               "createdBy",
//               "updatedBy",
//               "deletedAt",
//               "deletedBy",
//               "activeToken",
//               "resetToken",
//             ]),
//           },
//         };
//       }),
//     };
//   };

//   static createOrder = async ({
//     req,
//     res,
//   }: {
//     req: Request;
//     res: Response;
//   }) => {
//     const { dataSource } = req.app.locals;
//     const { session } = res.locals;
//     const orderRepository = dataSource.getRepository(Order);
//     const orderDetailRepository = dataSource.getRepository(OrderDetail);
//     const paymentMethodRepository = dataSource.getRepository(PaymentMethod);
//     const shippingMethodRepository = dataSource.getRepository(ShippingMethod);
//     const addressRepository = dataSource.getRepository(Address);
//     const discountRepository = dataSource.getRepository(Discount);
//     const userDiscountRepository = dataSource.getRepository(UserDiscount);
//     const shopRepository = dataSource.getRepository(Shop);
//     const productRepository = dataSource.getRepository(Product);

//     const {
//       paymentMethodId,
//       shippingMethodId,
//       addressId,
//       discountId,
//       orderDetails,
//       shopId,
//       shippingFee,
//       totalAmount,
//     } = req.body;

//     const paymentMethod = await paymentMethodRepository.findOneBy({
//       id: paymentMethodId,
//     });
//     if (!paymentMethod) {
//       throw new NotAcceptableError("Payment method not found");
//     }

//     const shippingMethod = await shippingMethodRepository.findOneBy({
//       id: shippingMethodId,
//     });
//     if (!shippingMethod) {
//       throw new NotAcceptableError("Shipping method not found");
//     }

//     const address = await addressRepository.findOneBy({
//       id: addressId,
//     });
//     if (!address) {
//       throw new NotAcceptableError("Address not found");
//     }

//     const shop = await shopRepository.findOneBy({
//       id: shopId,
//     });
//     if (!shop) {
//       throw new NotAcceptableError("Shop not found");
//     }

//     if (discountId) {
//       const discount = await discountRepository.findOneBy({
//         id: discountId,
//       });
//       if (!discount) {
//         throw new NotAcceptableError("Discount not found");
//       }
//       discount.used++;
//       const temp = userDiscountRepository.create({
//         user: session.userId,
//         discount,
//         used: true,
//       });
//       await Promise.all([
//         discountRepository.save(discount),
//         userDiscountRepository.save(temp),
//       ]);
//     }

//     const products = await productRepository.find({
//       where: {
//         id: In(orderDetails.map((item: any) => item.productId)),
//       },
//     });

//     const isOutOfStock = products.some(
//       (product: Product, index: number) =>
//         product.stock < orderDetails[index].quantity
//     );

//     if (isOutOfStock) {
//       throw new NotAcceptableError("Product is out of stock");
//     }

//     const order = orderRepository.create({
//       paymentMethod: paymentMethodId,
//       shippingMethod: shippingMethodId,
//       address: addressId,
//       discount: discountId ? discountId : null,
//       user: session.userId,
//       createdBy: session.userId,
//       shop: shopId,
//       shippingFee,
//       totalAmount,
//       orderStatus: OrderStatus.WAITING_VERIFY,
//     });

//     const orderDetailsEntities = orderDetails.map((orderDetail: any) => {
//       const orderDetailEntity = orderDetailRepository.create({
//         product: orderDetail.productId,
//         quantity: orderDetail.quantity,
//         price: orderDetail.price,
//         createdBy: session.userId,
//       });

//       return orderDetailEntity;
//     });

//     await Promise.all(
//       orderDetails.map((orderDetail: any) => {
//         return productRepository.query(
//           `UPDATE products SET stock = stock - ${orderDetail.quantity} WHERE id = '${orderDetail.productId}'`
//         );
//       })
//     );

//     const savedOrder = await orderRepository.save(order);
//     await orderDetailRepository.save(
//       orderDetailsEntities.map((orderDetail: OrderDetail) => {
//         orderDetail.order = savedOrder;
//         return orderDetail;
//       })
//     );

//     return savedOrder;
//   };
//   static updateOrderStatus = async ({
//     req,
//     res,
//   }: {
//     req: Request;
//     res: Response;
//   }) => {
//     const { dataSource, socket } = req.app.locals;
//     const { session } = res.locals;
//     const orderRepository = dataSource.getRepository(Order);

//     const { status } = req.body;
//     const id = req.params.id;

//     const order = await orderRepository.findOne({
//       relations: {
//         user: true,
//         shop: {
//           owner: true,
//         },
//       },
//       where: {
//         id,
//       },
//     });

//     if (!order) {
//       throw new NotAcceptableError("Order not found");
//     }

//     if (session.userId !== order.shop.owner.id) {
//       throw new NotAcceptableError("You are not owner of this order");
//     }

//     const inValidStatusWorkFlow = this.checkChangeOrderStatusWorkFlow(
//       order!.orderStatus,
//       status
//     );

//     if (inValidStatusWorkFlow) {
//       throw new NotAcceptableError(inValidStatusWorkFlow);
//     }

//     order!.orderStatus = status;
//     await orderRepository.save(order!);

//     const urlChangeOrderStatus = `/order/${order!.id}`;

//     await createNotification({
//       title: "Order status has been updated",
//       assignee: order!.user.id,
//       content: `The order ${order.id} has been updated to ${status}`,
//       createdBy: session.userId,
//       dataSource: dataSource,
//       socket: socket,
//       actions: urlChangeOrderStatus,
//     });

//     return order;
//   };
//   static makeOrderCompleted = async ({
//     req,
//     res,
//   }: {
//     req: Request;
//     res: Response;
//   }) => {
//     const { dataSource, socket } = req.app.locals;
//     const { session } = res.locals;
//     const orderRepository = dataSource.getRepository(Order);

//     const { status } = {
//       status: OrderStatus.COMPLETED,
//     };
//     const id = req.params.id;

//     const order = await orderRepository.findOne({
//       relations: {
//         user: true,
//         shop: {
//           owner: true,
//         },
//       },
//       where: {
//         id,
//       },
//     });

//     if (!order) {
//       throw new NotAcceptableError("Order not found");
//     }

//     if (session.userId !== order.user.id) {
//       throw new NotAcceptableError("You are not owner of this order");
//     }

//     const inValidStatusWorkFlow = this.checkChangeOrderStatusWorkFlow(
//       order!.orderStatus,
//       status
//     );

//     if (inValidStatusWorkFlow) {
//       throw new NotAcceptableError(inValidStatusWorkFlow);
//     }

//     order!.orderStatus = status;
//     await orderRepository.save(order!);

//     const urlChangeOrderStatus = `/order/${order!.id}`;

//     await createNotification({
//       title: "Order status has been updated",
//       assignee: order!.user.id,
//       content: `The order ${order.id} has been updated to ${status}`,
//       createdBy: session.userId,
//       dataSource: dataSource,
//       socket: socket,
//       actions: urlChangeOrderStatus,
//     });

//     return order;
//   };

//   static checkChangeOrderStatusWorkFlow = (
//     currentStatus: OrderStatus,
//     newStatus: OrderStatus
//   ) => {
//     if (
//       !OrderStatusesEnumActive[
//         currentStatus as keyof typeof OrderStatusesEnumActive
//       ].includes(newStatus)
//     ) {
//       return `Can not update order status to ${newStatus}`;
//     }
//     return null;
//   };
// }
export default class OrderRepository {
  static getOrderById = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {};
  static getListOrder = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {};

  static createOrder = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {};
  static updateOrderStatus = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {};
  static makeOrderCompleted = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {};

  static checkChangeOrderStatusWorkFlow = (
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => {};
}
