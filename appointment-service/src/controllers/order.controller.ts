import { NextFunction, Request, Response } from "express";
import Authenticate from "../decorators/authenticate";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Get, Post } from "../decorators/handlers";
import { SystemRole } from "../utils/enums";
import OrderRepository from "../database/repositories/order.repository";

@Controller("/orders")
@Authenticate()
export default class OrderController {
  @Get("/:id")
  @Authorize([SystemRole.Admin])
  public async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await OrderRepository.getOrderById({ req, res });
      res.locals.data = {
        ...response,
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  @Post("/")
  @Authorize([SystemRole.User])
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await OrderRepository.createOrder({ req, res });
      res.locals.data = {
        ...response,
      };

      next();
    } catch (error) {
      next(error);
    }
  }
  @Post("/:id/status")
  @Authorize([SystemRole.Admin])
  public async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await OrderRepository.updateOrderStatus({
        req,
        res,
      });
      res.locals.data = {
        ...response,
      };

      next();
    } catch (error) {
      next(error);
    }
  }
  @Post("/:id/completed")
  @Authorize([SystemRole.User])
  public async makeOrderCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await OrderRepository.makeOrderCompleted({
        req,
        res,
      });
      res.locals.data = {
        ...response,
      };

      next();
    } catch (error) {
      next(error);
    }
  }
}
