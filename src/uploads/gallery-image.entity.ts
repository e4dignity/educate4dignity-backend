import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('GalleryImage')
export class GalleryImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'journey' })
  category!: string; // 'journey' | 'workshop' | 'impact'

  @Column('simple-array', { default: '' })
  tags!: string[];

  @CreateDateColumn()
  uploadedAt!: Date;

  @Column({ default: true })
  isPublic!: boolean;
}