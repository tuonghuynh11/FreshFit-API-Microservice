import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Expert } from "./Expert";
export enum DegreeType {
  ASSOCIATE = "ASSOCIATE",
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
  DOCTORATE = "DOCTORATE",
}

@Entity("expert_educations")
export class ExpertEducation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Expert, (expert) => expert.educations, {
    onDelete: "CASCADE",
  })
  expert: Expert;

  @Column({ type: "varchar", length: 255 })
  institution: string;

  @Column({
    type: "enum",
    enum: DegreeType,
  })
  degree: string;

  @Column({ type: "varchar", length: 255 })
  fieldOfStudy: string;

  @Column({ type: "int" })
  startYear: number;

  @Column({ type: "int", nullable: true })
  endYear: number; // NULL means still studying

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
