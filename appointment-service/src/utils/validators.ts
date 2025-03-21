import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import UserService from "../services/user.services";
import AppointmentService from "../services/appointment.services";

@ValidatorConstraint({ async: true })
export class IsUserExistsConstraint implements ValidatorConstraintInterface {
  async validate(userId: string) {
    const user = await UserService.checkUserExisted({
      userId,
    }); // Replace with your actual DB query
    return !!user; // Return true if user exists, false otherwise
  }

  defaultMessage() {
    return "User does not exist";
  }
}

export function IsUserExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserExistsConstraint,
    });
  };
}

@ValidatorConstraint({ async: true })
export class IsExpertExistsConstraint implements ValidatorConstraintInterface {
  async validate(expertId: string) {
    const user = await AppointmentService.checkExpertExisted({
      expertId,
    }); // Replace with your actual DB query
    return !!user; // Return true if user exists, false otherwise
  }

  defaultMessage() {
    return "Expert does not exist";
  }
}

export function IsExpertExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExpertExistsConstraint,
    });
  };
}
