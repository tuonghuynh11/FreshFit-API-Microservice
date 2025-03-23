import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Expert } from "./Expert";
import { Skill } from "./Skill";

@Entity("expert_skills")
export class ExpertSkill {
  @PrimaryColumn()
  expertId: string;

  @PrimaryColumn()
  skillId: string;

  @ManyToOne(() => Expert, (expert) => expert.expertSkills, {
    onDelete: "CASCADE",
  })
  expert: Expert;

  @ManyToOne(() => Skill, (skill) => skill.expertSkills, {
    onDelete: "CASCADE",
  })
  skill: Skill;

  @Column({ default: false })
  isMainSkill: boolean;
}
