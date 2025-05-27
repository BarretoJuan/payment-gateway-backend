import { Column, Entity, Index, OneToMany } from "typeorm";
import { Transaction } from "../../transaction/entities/transaction.entity";
import { UserCourse } from "../../user-course/entities/user-course.entity";
import { OneTimePassword } from "../../one-time-password/entities/one-time-password.entity";

@Index("USER_email_key", ["email"], { unique: true })
@Index("UQ_c090db0477be7a25259805e37c2", ["email"], { unique: true })
@Index("USER_pkey", ["id"], { unique: true })
@Index("UQ_05349e17b520cd71c54b4977cf0", ["identificationNumber"], {
  unique: true,
})
@Index("USER_identification_number_key", ["identificationNumber"], {
  unique: true,
})
@Entity("USER", { schema: "public" })
export class User {
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

  @Column("character varying", { name: "identification_number", unique: true })
  identificationNumber: string;

  @Column("character varying", { name: "first_name", nullable: true })
  firstName: string | null;

  @Column("character varying", { name: "last_name", nullable: true })
  lastName: string | null;

  @Column("character varying", { name: "email", unique: true })
  email: string;

  @Column("enum", {
    name: "role",
    nullable: true,
    enum: ["admin", "accounting", "user"],
  })
  role: "admin" | "accounting" | "user" | null;

  @Column("numeric", { name: "balance", nullable: true })
  balance: string | null;

  @OneToMany(() => OneTimePassword, (oneTimePassword) => oneTimePassword.user)
  oneTimePasswords: OneTimePassword[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.validatedBy)
  transactions2: Transaction[];

  @OneToMany(() => UserCourse, (userCourse) => userCourse.user)
  userCourses: UserCourse[];
}
