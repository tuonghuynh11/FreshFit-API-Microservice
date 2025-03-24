import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Get, Post } from "../decorators/handlers";
import { EXPERT_MESSAGES } from "../common/messages/index.messages";
import ExpertRepository from "../database/repositories/epxert.repository";
import Authorize from "../decorators/authorize";
import { SystemRole } from "../utils/enums";
import { UseMiddlewares } from "../decorators/middleware";
import { validatePagination } from "../middlewares/pagination.middlewares";

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
  @Get("/info/access-token")
  @Authorize([SystemRole.Expert])
  public async getExpertInfoByAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.getExpertInfoByAccessToken({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_INFO_SUCCESS;
      res.locals.data = {
        expertInfo,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Get("/:userId")
  @Authorize([SystemRole.Admin])
  public async getExpertInfoByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.getExpertInfoByUserId({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_INFO_SUCCESS;
      res.locals.data = {
        expertInfo,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Get("/")
  @Authorize("*")
  @UseMiddlewares(validatePagination)
  public async filterExpert(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { experts, limit, page, total_items, total_pages } =
        await ExpertRepository.filterExpert(req);
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_SUCCESS;
      res.locals.data = {
        experts,
        limit,
        page,
        total_items,
        total_pages,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
}
