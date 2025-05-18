import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Courses } from "../../course/entities/course.entity";
import { User } from "../../user/entities/user.entity";

@Index("user-course_pkey", ["id"], { unique: true })
@Entity("USER-COURSE", { schema: "public" })
export class UserCourse {
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

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["acquired", "not_acquired", "cancelled", "expired"],
  })
  status: "acquired" | "not_acquired" | "cancelled" | "expired" | null;

  @Column("character varying", { name: "cancellation_reason", nullable: true })
  cancellationReason: string | null;

  @Column("character varying", { name: "token", nullable: true })
  token: string | null;

  @Column("numeric", { name: "balance", default: () => "'0'" })
  balance: string;

  @ManyToOne(() => Courses, (courses) => courses.userCourses, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "course_id", referencedColumnName: "id" }])
  course: Courses;

  @ManyToOne(() => User, (user) => user.userCourses, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
