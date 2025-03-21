import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Expert } from "./Expert";

@Entity("expert_experiences")
export class ExpertExperience {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Expert, (expert) => expert.experiences, {
    onDelete: "CASCADE",
  })
  expert: Expert;

  @Column({ type: "varchar", length: 255 })
  company: string;

  @Column({ type: "varchar", length: 255 })
  position: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date; // NULL means still working

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
