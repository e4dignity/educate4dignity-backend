import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  // Convert legacy text column with comma-separated tags to text[] and update rows
  try {
    console.log('Altering BlogPost.tags column to text[] ...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "BlogPost" ALTER COLUMN "tags" TYPE text[] USING CASE WHEN "tags" IS NULL OR "tags" = '' THEN ARRAY[]::text[] ELSE regexp_split_to_array("tags",',') END;`);
    console.log('Column altered. Verifying rows...');
    const posts = await prisma.blogPost.findMany({ select: { slug: true, tags: true } });
    posts.forEach(p => console.log(p.slug, p.tags));
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
