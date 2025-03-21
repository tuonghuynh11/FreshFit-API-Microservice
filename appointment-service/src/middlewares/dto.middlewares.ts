import { HttpStatusCode } from "axios";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateDto = (DtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(DtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      return res.status(HttpStatusCode.BadRequest).json({
        message: "Validation failed",
        errors: errors.map((err) => ({
          property: err.property,
          // constraints: err.constraints,
          message: Object.values(err.constraints || {}),
        })),
      });
    }

    next();
  };
};
