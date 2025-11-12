import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany } from 'typeorm';
import { Donation } from './donation.entity';

@Entity()
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: false })
  anonymous!: boolean;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  language?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Donation, (d) => d.donor)
  donations!: Donation[];
}
