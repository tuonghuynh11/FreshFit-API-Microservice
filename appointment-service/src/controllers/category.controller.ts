import { NextFunction, Request, Response } from "express";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Delete, Get, Post, Put } from "../decorators/handlers";
import { SystemRole } from "../utils/enums";
import ProductCategoryRepository from "../database/repositories/category.repository";

@Controller("/categories")
export default class CategoryController {
  @Get("/")
  public async index(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ProductCategoryRepository.getAllCategories(req);
      res.locals.data = response;

      next();
    } catch (error) {
      next(error);
    }
  }

  /////// What role should be able to add a category?
  @Post("/")
  @Authorize([SystemRole.Admin])
  public async add(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ProductCategoryRepository.add({ req, res });
      res.locals.data = response;
      next();
    } catch (error) {
      next(error);
    }
  }

  @Get("/:id")
  public async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any =
        await ProductCategoryRepository.getProductCategoryById(req);
      res.locals.data = {
        productCategory: response.productCategory,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Put("/:id")
  @Authorize([SystemRole.Admin])
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await ProductCategoryRepository.update({
        req,
        res,
      });
      res.locals.data = {
        productCategory: response.productCategory,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  /////Delete this can affect the products and many other things, consider some checks before deleting !important
  @Delete("/:id")
  @Authorize([SystemRole.Admin])
  public async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProductCategoryRepository.softDelete(req, res);
      res.locals.message = "Product category successfully deleted";
      next();
    } catch (error) {
      next(error);
    }
  }
  @Delete("/:id/permanently")
  @Authorize([SystemRole.Admin])
  public async hardDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProductCategoryRepository.hardDelete(req, res);
      res.locals.message = "Product category successfully deleted permanently";
      next();
    } catch (error) {
      next(error);
    }
  }
}
