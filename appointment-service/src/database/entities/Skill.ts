import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ExpertSkill } from "./ExpertSkill";

@Entity("skills")
export class Skill {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @OneToMany(() => ExpertSkill, (expertSkill) => expertSkill.skill, {
    cascade: true,
  })
  expertSkills: ExpertSkill[];
}
