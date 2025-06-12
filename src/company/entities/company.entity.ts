import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("COMPANY")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  telephone_number: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column("text", { name: "image", nullable: true })
  image: string | null;

  @Column("text", { name: "company_identification", nullable: true})
  company_identification: string | null;

  @Column("enum", {
    name: "payment_preference",
    nullable: true,
    default: "both",
    enum: ["paypal", "zelle", "both"],
  })
  payment_preference:
    | "paypal"
    | "zelle"
    | "both"
    | null;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
