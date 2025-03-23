import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Post } from "../decorators/handlers";
import { EXPERT_MESSAGES } from "../common/messages/index.messages";
import ExpertRepository from "../database/repositories/epxert.repository";

@Controller("/experts")
export default class ExpertController {
  @Post("/create")
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ExpertRepository.create(req);
      res.locals.message = EXPERT_MESSAGES.CREATE_EXPERT_SUCCESS;
      res.locals.data = response;
      next();
    } catch (error) {
      next(error);
    }
  }
}
