import { Column, Entity, OneToMany } from "typeorm";
import { AppBaseEntity } from "./AppBase";
import { ExpertAvailability } from "./ExpertAvailability";
import { Appointment } from "./Appointments";
import { ExpertReview } from "./ExpertReview";
import { ExpertEducation } from "./ExpertEducation";
import { ExpertExperience } from "./ExpertExperience";
import { ExpertCertification } from "./ExpertCertification";
import { ExpertSkill } from "./ExpertSkill";

@Entity("experts")
export class Expert extends AppBaseEntity {
  @Column({ nullable: false })
  userId: string;
  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  specialization: string;

  @Column()
  experience_years: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: "float", default: 0 })
  rating?: number;

  @Column({ default: 0 })
  total_reviews?: number;

  @OneToMany(
    () => ExpertCertification,
    (certification) => certification.expert,
    {
      cascade: true,
    }
  )
  certifications: ExpertCertification[];

  @Column({ type: "text", array: true, nullable: true })
  languages: string[];

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  consultation_fee: number;

  @OneToMany(() => ExpertEducation, (education) => education.expert, {
    cascade: true,
  })
  educations: ExpertEducation[];

  @OneToMany(() => ExpertExperience, (experience) => experience.expert, {
    cascade: true,
  })
  experiences: ExpertExperience[];
  @OneToMany(
    () => ExpertAvailability,
    (expertAvailability) => expertAvailability.expert
  )
  availabilities?: ExpertAvailability[];

  @OneToMany(() => Appointment, (appointment) => appointment.expert)
  appointments?: Appointment[];

  @OneToMany(() => ExpertReview, (expertReview) => expertReview.expert)
  reviews?: ExpertReview[];

  @OneToMany(() => ExpertSkill, (expertSkill) => expertSkill.expert, {
    cascade: true,
  })
  expertSkills: ExpertSkill[];
}
