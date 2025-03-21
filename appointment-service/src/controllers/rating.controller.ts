import { NextFunction, Request, Response } from "express";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Get, Post } from "../decorators/handlers";
import { SystemRole } from "../utils/enums";
import RatingRepository from "../database/repositories/rating.repository";

@Controller("/ratings")
export default class RatingController {
  @Post("/:idProduct")
  @Authorize([SystemRole.User])
  public async add(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await RatingRepository.add({ req, res });
      res.locals.data = response;
      next();
    } catch (error) {
      next(error);
    }
  }

  @Get("/:idProduct")
  public async getAllRatingOfProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await RatingRepository.getAllRatingOfProduct(req);
      res.locals.data = response;

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Get("/:idProduct/summary")
  public async getSummaryRatingOfProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await RatingRepository.getSummaryRatingOfProduct(req);
      res.locals.data = response;

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  /////Is it ok to delete products cause it can link to many others table, how to handle all the cases?
}
