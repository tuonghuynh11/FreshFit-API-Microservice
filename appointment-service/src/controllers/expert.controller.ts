import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Get, Post, Put } from "../decorators/handlers";
import {
  EXPERT_AVAILABILITY_MESSAGES,
  EXPERT_MESSAGES,
} from "../common/messages/index.messages";
import ExpertRepository from "../database/repositories/epxert.repository";
import Authorize from "../decorators/authorize";
import { SystemRole } from "../utils/enums";
import { UseMiddlewares } from "../decorators/middleware";
import { validatePagination } from "../middlewares/pagination.middlewares";
import { validateMonth } from "../middlewares/month.middlewares";

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
  @Get("/exists/:userId")
  public async checkExpertExistByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.checkExpertExistByUserId({
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

  @Post("/availability/set")
  @Authorize([SystemRole.Expert])
  public async createAvailabilities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ExpertRepository.createAvailabilities({
        req,
        res,
      });
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.CREATE_AVAILABILITY_SUCCESS;
      res.locals.data = response;
      next();
    } catch (error) {
      next(error);
    }
  }

  @Get("/availability/:expertId")
  @Authorize([SystemRole.Admin, SystemRole.Expert])
  @UseMiddlewares(validateMonth)
  public async getExpertAvailabilityById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const availabilities = await ExpertRepository.getExpertAvailabilityById(
        req
      );
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.GET_AVAILABILITIES_SUCCESS;
      res.locals.data = {
        availabilities,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Put("/availability/:id")
  @Authorize([SystemRole.Expert])
  public async updateAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const availability: any = await ExpertRepository.updateAvailability({
        req,
        res,
      });
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.UPDATE_AVAILABILITY_SUCCESS;
      res.locals.data = {
        availability,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Delete("/availability/:id")
  @Authorize([SystemRole.Expert])
  public async deleteAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await ExpertRepository.deleteAvailability({
        req,
        res,
      });
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.DELETE_AVAILABILITY_SUCCESS;
      res.locals.data = null;

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
}
