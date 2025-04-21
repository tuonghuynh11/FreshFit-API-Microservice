import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { AppBaseEntity } from "./AppBase";
import { Expert } from "./Expert";
import { Appointment } from "./Appointments";

@Entity("expert_availabilities")
export class ExpertAvailability extends AppBaseEntity {
  @Column({ type: "date" })
  date: Date;

  @Column({ type: "timestamptz" })
  startTime: Date;

  @Column({ type: "timestamptz" })
  endTime: Date;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Expert, (expert) => expert.availabilities)
  expert?: Expert;

  @OneToMany(() => Appointment, (appointment) => appointment.available)
  appointments: Appointment[];
}
