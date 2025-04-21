import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { AppBaseEntity } from "./AppBase";
import { Expert } from "./Expert";
import { ExpertReview } from "./ExpertReview";
import { ExpertAvailability } from "./ExpertAvailability";
import { AppointmentReview } from "./AppointmentReview";

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}
export enum AppointmentType {
  CALL = "CALL",
  MESSAGE = "MESSAGE",
}

export enum CancelerType {
  USER = "USER",
  EXPERT = "EXPERT",
  SYSTEM = "SYSTEM",
}

@Entity("appointments")
export class Appointment extends AppBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => Expert, (expert) => expert.appointments)
  expert: Expert;

  // @OneToOne(() => ExpertAvailability)
  // @JoinColumn()
  // available: ExpertAvailability;
  @ManyToOne(
    () => ExpertAvailability,
    (expertAvailability) => expertAvailability.appointments
  )
  available?: ExpertAvailability;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  meetingLink: string;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  issues: string; // Issues needing advice

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  fees: number;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({
    type: "enum",
    enum: AppointmentType,
  })
  type: AppointmentType;

  @Column({ nullable: true })
  canceler: CancelerType;

  @OneToOne(() => ExpertReview)
  @JoinColumn()
  expertReview: ExpertReview;

  @OneToOne(() => AppointmentReview)
  @JoinColumn()
  appointmentReview: AppointmentReview;
}
