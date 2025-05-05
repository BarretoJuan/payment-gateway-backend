import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Courses } from "../../course/entities/course.entity";

@Index("INSTALLMENT_pkey", ["id"], { unique: true })
@Entity("INSTALLMENT", { schema: "public" })
export class Installment {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
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

  @Column("date", { name: "date" })
  date: Date;

  @Column("integer", { name: "percentage" })
  percentage: number;

  @Column("varchar", { name: "course_id" })
  courseId: string;

  @ManyToOne(() => Courses, (courses) => courses.installments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "course_id", referencedColumnName: "id" }])
  course: Courses;
}
