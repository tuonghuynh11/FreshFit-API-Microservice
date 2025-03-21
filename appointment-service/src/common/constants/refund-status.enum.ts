import { RefundStatus } from "../../utils/enums";

export const RefundStatusesEnumActive = {
  [RefundStatus.PENDING]: [
    RefundStatus.PENDING,
    RefundStatus.PROCESSING,
    RefundStatus.ACCEPTED,
    RefundStatus.REJECTED,
  ],
};
