import AppointmentController from "../controllers/appointment.controller";
import CategoryController from "../controllers/category.controller";
import MediaController from "../controllers/media.controller";
import OrderController from "../controllers/order.controller";
import PaymentController from "../controllers/payment.controller";
import RatingController from "../controllers/rating.controller";

export const appRouters = [
  {
    rootPath: "/api/v1",
    controllers: [
      MediaController,
      OrderController,
      CategoryController,
      PaymentController,
      RatingController,
      AppointmentController,
    ],
  },
];
