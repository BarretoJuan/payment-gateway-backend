import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Index("ONE-TIME-PASSWORD_pkey", ["id"], { unique: true })
@Entity("ONE-TIME-PASSWORD", { schema: "public" })
export class OneTimePassword {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("integer", { name: "code" })
  code: number;

  @Column("boolean", { name: "used", nullable: true, default: () => "false" })
  used: boolean | null;

  @ManyToOne(() => User, (user) => user.oneTimePasswords, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
