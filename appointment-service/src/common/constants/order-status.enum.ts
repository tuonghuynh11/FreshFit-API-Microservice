import { OrderStatus } from "../../utils/enums";

export const OrderStatusesEnumActive = {
  [OrderStatus.WAITING_VERIFY]: [
    OrderStatus.WAITING_VERIFY,
    OrderStatus.WAITING_GET,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.WAITING_GET]: [
    OrderStatus.WAITING_GET,
    OrderStatus.WAITING_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.WAITING_DELIVERY]: [
    OrderStatus.WAITING_DELIVERY,
    OrderStatus.IN_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.IN_DELIVERY]: [
    OrderStatus.IN_DELIVERY,
    OrderStatus.DELIVERY_FAILED,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.DELIVERY_FAILED]: [
    OrderStatus.DELIVERY_FAILED,
    OrderStatus.IN_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.COMPLETED]: [OrderStatus.COMPLETED],
  [OrderStatus.CANCELLED]: [OrderStatus.CANCELLED],
};
