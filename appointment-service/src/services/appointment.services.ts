import { AppDataSource } from "../database/data-source";
import { Appointment } from "../database/entities/Appointments";
import { Expert } from "../database/entities/Expert";
const dataSource = AppDataSource;
const appointmentRepository = dataSource.getRepository(Appointment);
const expertRepository = dataSource.getRepository(Expert);
export default class AppointmentService {
  static checkExpertExisted = async ({ expertId }: { expertId: string }) => {
    const expert = await expertRepository.findOneBy({ id: expertId });
    return expert;
  };
}
