import { Column, Entity, ManyToOne } from "typeorm";
import { AppBaseEntity } from "./AppBase";
import { Expert } from "./Expert";

@Entity("expert_reviews")
export class ExpertReview extends AppBaseEntity {
  @Column()
  userId?: string;

  @ManyToOne(() => Expert, (expert) => expert.reviews)
  expert?: Expert;

  @Column({ type: "float" })
  rating: number;

  @Column({ nullable: true })
  content: string;
}
