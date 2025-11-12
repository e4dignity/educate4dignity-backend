import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { dateTimeColumnType } from '../common/db-types';

@Entity('BlogPost')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  slug!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'text', nullable: true })
  coverImageUrl!: string | null;

  @Column({ type: 'boolean', default: false })
  coverConsentVerified!: boolean;

  @Column({ type: 'text' })
  author!: string;

  @Column({ type: 'text', nullable: true })
  authorRole!: string | null;

  @Column({ type: 'text', nullable: true })
  authorBio!: string | null;

  @Column({ type: 'text', nullable: true })
  authorAvatarUrl!: string | null;

  @Column({ type: dateTimeColumnType as any, nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'text' })
  contentHtml!: string;

  @Column({ type: 'text', nullable: true })
  contentMarkdown!: string | null;

  @Column({ type: 'text', default: 'impact' })
  category!: string;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[] | null;

  @Column({ type: 'integer', default: 5 })
  readMinutes!: number;

  @Column({ type: 'text', nullable: true })
  calloutTransparency!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  relatedSlugs!: string[] | null;

  @Column({ type: 'text', nullable: true })
  seoTitle!: string | null;

  @Column({ type: 'text', nullable: true })
  seoDescription!: string | null;

  @Column({ type: 'text', default: 'published' })
  status!: string;

  @Column({ type: 'integer', default: 0 })
  views!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
