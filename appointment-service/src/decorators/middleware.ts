import { Request, Response, NextFunction } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export function UseMiddlewares(...middlewares: Middleware[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      let index = 0;

      const runMiddlewares = (err?: any) => {
        if (err) {
          return next(err);
        }
        if (index < middlewares.length) {
          return middlewares[index++](req, res, runMiddlewares);
        }
        return originalMethod.apply(this, [req, res, next]);
      };

      runMiddlewares();
    };
  };
}
