import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Index('OPERATOR_email_key', ['email'], { unique: true })
@Index('OPERATOR_pkey', ['id'], { unique: true })
@Index('OPERATOR_identification_key', ['identification'], { unique: true })
@Entity('OPERATOR', { schema: 'public' })
export class Operator {
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

  @Column('character varying', { name: 'email', unique: true })
  email: string;

  @Column('character varying', { name: 'identification', unique: true })
  identification: string;

  @Column('character varying', { name: 'first_name', nullable: true })
  firstName: string | null;

  @Column('character varying', { name: 'last_name', nullable: true })
  lastName: string | null;

  @Column('enum', {
    name: 'role',
    nullable: true,
    enum: ['admin', 'accounting'],
  })
  role: 'admin' | 'accounting' | null;

  @OneToMany(() => Transaction, (transaction) => transaction.validatedBy)
  transactions: Transaction[];
}
