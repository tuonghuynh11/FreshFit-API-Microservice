import { MetadataKeys, SystemRole } from "../utils/enums";
import { IAuthorize } from "../utils/interfaces";

const Authorize = (roles: SystemRole[] | string = "*"): MethodDecorator => {
  return (target, propertyKey) => {
    const controllerClass = target.constructor;

    const authorizes: IAuthorize[] = Reflect.hasMetadata(
      MetadataKeys.AUTHORIZE,
      controllerClass
    )
      ? Reflect.getMetadata(MetadataKeys.AUTHORIZE, controllerClass)
      : [];

    authorizes.push({
      roles,
      handlerName: propertyKey,
    });

    Reflect.defineMetadata(MetadataKeys.AUTHORIZE, authorizes, controllerClass);
  };
};

export default Authorize;
