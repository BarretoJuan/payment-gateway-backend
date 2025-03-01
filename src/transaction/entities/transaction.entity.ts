import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Courses } from "../../course/entities/course.entity";
import { User } from "../../user/entities/user.entity";

@Index("TRANSACTION_pkey", ["id"], { unique: true })
@Entity("TRANSACTION", { schema: "public" })
export class Transaction {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("timestamp without time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @Column("numeric", { name: "amount", nullable: true })
  amount: string | null;

  @Column("character varying", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "payment_method",
    nullable: true,
    enum: ["paypal", "zelle"],
  })
  paymentMethod: "paypal" | "zelle" | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["completed", "in_process", "rejected", "ready_to_be_checked"],
  })
  status:
    | "completed"
    | "in_process"
    | "rejected"
    | "ready_to_be_checked"
    | null;

  @ManyToOne(() => Courses, (courses) => courses.transactions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "course_id", referencedColumnName: "id" }])
  course: Courses;

  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => User, (user) => user.validatedTransactions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "validated_by", referencedColumnName: "id" }])
  validatedBy: User;
}
