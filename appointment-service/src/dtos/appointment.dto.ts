import { IsString, IsOptional, IsEnum, IsNotEmpty } from "class-validator";
import { AppointmentType } from "../database/entities/Appointments";
import { IsExpertExists, IsUserExists } from "../utils/validators";

export class AppointmentDto {
  @IsString()
  @IsNotEmpty()
  @IsUserExists({ message: "User ID does not exist" }) // Custom validation
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsExpertExists({ message: "Expert ID does not exist" }) // Custom registration
  expertId: string;

  @IsString()
  @IsNotEmpty()
  availableId: string;

  @IsString()
  @IsOptional()
  issues?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(AppointmentType)
  type: AppointmentType;
}
