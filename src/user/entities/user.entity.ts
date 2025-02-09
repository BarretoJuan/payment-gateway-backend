import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { UserCourse } from '../../user-course/entities/user-course.entity';

@Index('USER_pkey', ['id'], { unique: true })
@Index('USER_identification_number_key', ['identificationNumber'], {
  unique: true,
})
@Entity('USER', { schema: 'public' })
export class User {
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

  @Column('character varying', { name: 'identification_number', unique: true })
  identificationNumber: string;

  @Column('character varying', { name: 'first_name', nullable: true })
  firstName: string | null;

  @Column('character varying', { name: 'last_name', nullable: true })
  lastName: string | null;

  @Column('character varying', { name: 'password', nullable: true })
  password: string | null;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => UserCourse, (userCourse) => userCourse.user)
  userCourses: UserCourse[];
}
