import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Expert } from "./Expert";

@Entity("expert_certifications")
export class ExpertCertification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Expert, (expert) => expert.certifications, {
    onDelete: "CASCADE",
  })
  expert: Expert;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  issuingOrganization: string;

  @Column({ type: "timestamptz" })
  issueDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  expirationDate?: Date;

  @Column({ nullable: true })
  credentialUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
