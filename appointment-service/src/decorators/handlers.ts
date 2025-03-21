import { HttpMethods, MetadataKeys } from "../utils/enums";

export interface IRouter {
  method: HttpMethods;
  path: string;
  handlerName: string | symbol;
}

const methodDecoratorFactory = (method: HttpMethods) => {
  return (path: string): MethodDecorator => {
    return (target, propertyKey) => {
      const controllerClass = target.constructor;

      const routers: IRouter[] = Reflect.hasMetadata(
        MetadataKeys.ROUTERS,
        controllerClass
      )
        ? Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass)
        : [];

      routers.push({
        method,
        path,
        handlerName: propertyKey,
      });

      Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
    };
  };
};

export const Get = methodDecoratorFactory(HttpMethods.GET);
export const Post = methodDecoratorFactory(HttpMethods.POST);
export const Put = methodDecoratorFactory(HttpMethods.PUT);
export const Delete = methodDecoratorFactory(HttpMethods.DELETE);
export const Patch = methodDecoratorFactory(HttpMethods.PATCH);
