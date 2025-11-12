import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Donor } from './donor.entity';

export type DonationStatus = 'OPEN' | 'COMPLETE' | 'EXPIRED';
export type DonationType = 'one-time' | 'recurring';

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Donor, (d) => d.donations, { eager: true, onDelete: 'SET NULL', nullable: true })
  donor!: Donor | null;

  @Column({ type: 'integer' })
  amountCents!: number;

  @Column({ length: 12 })
  currency!: string;

  @Column({ type: 'text' })
  donationType!: DonationType;

  @Column({ type: 'text', nullable: true })
  purpose?: string | null; // General purpose description for Jessica's mission

  @Index()
  @Column({ unique: true })
  sessionId!: string;

  @Column({ type: 'text' })
  status!: DonationStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;
}
