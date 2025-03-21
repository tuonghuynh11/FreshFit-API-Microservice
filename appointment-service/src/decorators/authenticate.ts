import { MetadataKeys, SystemRole } from "../utils/enums";

const Authenticate = (roles: SystemRole[] | string = "*"): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetadataKeys.AUTHENTICATE, roles, target);
  };
};

export default Authenticate;
