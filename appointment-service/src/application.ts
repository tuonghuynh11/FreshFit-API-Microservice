import express, {
  Application as ExApplication,
  Handler,
  NextFunction,
  Request,
  Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "./middlewares/morgan";
import { appRouters } from "./routers";
import {
  BadRequestError,
  ForbiddenError,
  GoneError,
  InternalServerError,
  MethodNotAllowedError,
  NotAcceptableError,
  NotFoundError,
  UnauthorizedError,
} from "./utils/errors";
import { IRouter } from "./decorators/handlers";
import { MetadataKeys, SystemRole } from "./utils/enums";
import { TokenExpiredError, verify } from "jsonwebtoken";
import config from "./configuration";
import { IAuthorize } from "./utils/interfaces";
import { initFolder } from "./utils/file";
import { HttpStatusCode } from "axios";

class Application {
  private readonly _instance: ExApplication;

  get instance(): ExApplication {
    return this._instance;
  }

  constructor() {
    initFolder();
    this._instance = express();
    this._instance.use(morgan);
    this._instance.use(express.json());
    this._instance.use(express.urlencoded({ extended: false }));
    this._instance.use(
      cors({
        // origin: [configuration.clientSite],
        origin: "*",
        credentials: true,
      })
    );
    this._instance.use(cookieParser());
    this.middleware();
    this.registerRouters();
    this.handleErrors();
    this._instance.use(
      "/static/image",
      express.static(config.upload_image_dir)
    );
  }

  private middleware(): void {
    this._instance.use(
      async (req: Request, res: Response, next: NextFunction) => {
        res.locals.session = null;
        try {
          const { authorization } = req.headers;
          if (authorization) {
            const tmp = authorization.split(" ");
            if (tmp.length === 2 && tmp[0] === "Bearer") {
              const { dataSource } = req.app.locals;

              // verify token
              const decode: any = verify(tmp[1], config.jwtAccessKey);
              // Decode Type:
              //  {
              // user_id: '67e02531fa4fdb3b41d1aa98',
              // expert_id: 'c9054ff8-7e3e-4301-9a68-5a6ffb4e94f8',
              // role: 2,
              // token_type: 0,
              // verify: 1,
              // iat: 1747111747,
              // }

              console.log(decode);
              if (decode.verify !== 1) {
                throw new UnauthorizedError("User not verified");
              }
              res.locals.session = {
                user: decode,
                accessToken: tmp[1],
              };
            }
          }
          next();
        } catch (error) {
          console.log(error);

          next(error);
        }
      }
    );
  }

  private registerRouters(): void {
    for (let iar = 0; iar < appRouters.length; iar++) {
      const { rootPath, controllers } = appRouters[iar];
      for (let ic = 0; ic < controllers.length; ic++) {
        const controllerClass = controllers[ic];
        const controllerInstance: { [handleName: string]: Handler } =
          new controllerClass() as any;

        const basePath: string = Reflect.getMetadata(
          MetadataKeys.BASE_PATH,
          controllerClass
        );
        const authenticate: string = Reflect.getMetadata(
          MetadataKeys.AUTHENTICATE,
          controllerClass
        );
        const routers: IRouter[] = Reflect.getMetadata(
          MetadataKeys.ROUTERS,
          controllerClass
        );
        const authorizes: IAuthorize[] =
          Reflect.getMetadata(MetadataKeys.AUTHORIZE, controllerClass) || [];

        const exRouter = express.Router();

        for (let ir = 0; ir < routers.length; ir++) {
          const { method, path, handlerName } = routers[ir];
          exRouter[method](
            path,
            (req: Request, res: Response, next: NextFunction) => {
              let allowedRoles: SystemRole[] | string = authenticate;
              for (let i = 0; i < authorizes.length; i++) {
                if (authorizes[i].handlerName === handlerName) {
                  allowedRoles = authorizes[i].roles;
                }
              }
              // check role permission
              if (allowedRoles) {
                if (res.locals?.session?.user?.role === null) {
                  throw new UnauthorizedError();
                }
                const { role } = res.locals?.session?.user;
                if (
                  Array.isArray(allowedRoles) &&
                  role !== null &&
                  role !== undefined
                ) {
                  let isMatchRolePermission = allowedRoles.find(
                    (allowedRole: SystemRole) => allowedRole === role
                  );

                  if (
                    isMatchRolePermission === undefined ||
                    isMatchRolePermission === null
                  ) {
                    throw new ForbiddenError();
                  }
                }
              }
              next();
            },
            controllerInstance[String(handlerName)].bind(controllerInstance),
            (req: Request, res: Response) => {
              res.status(HttpStatusCode.Ok).json({
                // status: 200,
                // success: true,
                message: res.locals.message || "Success",
                data: res.locals.data || null,
                // session: res.locals.session,
              });
            }
          );
        }
        this._instance.use(`${rootPath}${basePath}`, exRouter);
      }
    }
  }

  private handleErrors(): void {
    this._instance.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        let statusCode = 503;
        if (err instanceof BadRequestError) {
          statusCode = 400;
        } else if (
          err instanceof UnauthorizedError ||
          err instanceof TokenExpiredError
        ) {
          statusCode = 401;
        } else if (err instanceof ForbiddenError) {
          statusCode = 403;
        } else if (err instanceof NotFoundError) {
          statusCode = 404;
        } else if (err instanceof MethodNotAllowedError) {
          statusCode = 405;
        } else if (err instanceof NotAcceptableError) {
          statusCode = 406;
        } else if (err instanceof GoneError) {
          statusCode = 410;
        } else if (err instanceof InternalServerError) {
          statusCode = 500;
        }

        res.status(statusCode).json({
          // status: statusCode,
          // success: false,
          message: err.message || "Failure",
          data: null,
          // session: res.locals.session,
        });
      }
    );
  }
}

export default new Application();
