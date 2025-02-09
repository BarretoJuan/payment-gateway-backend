import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { UserCourse } from '../../user-course/entities/user-course.entity';

@Index('COURSES_pkey', ['id'], { unique: true })
@Entity('COURSES', { schema: 'public' })
export class Courses {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @Column('timestamp without time zone', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp without time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('numeric', { name: 'price', nullable: true })
  price: string | null;

  @Column('character varying', { name: 'name', nullable: true })
  name: string | null;

  @Column('character varying', { name: 'description', nullable: true })
  description: string | null;

  @Column('jsonb', { name: 'image', nullable: true })
  image: object | null;

  @OneToMany(() => Transaction, (transaction) => transaction.course)
  transactions: Transaction[];

  @OneToMany(() => UserCourse, (userCourse) => userCourse.course)
  userCourses: UserCourse[];
}
