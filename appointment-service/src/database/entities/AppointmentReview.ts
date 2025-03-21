import { Column, Entity } from "typeorm";
import { AppBaseEntity } from "./AppBase";

@Entity("appointment_reviews")
export class AppointmentReview extends AppBaseEntity {
  @Column({ type: "float" })
  rating: number;

  @Column({ nullable: true })
  content: string;
}
