const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Drop the old blog_posts table using raw SQL
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "blog_posts" CASCADE;');
    console.log('Dropped old blog_posts table');
    
    // Check BlogPost table
    const count = await prisma.blogPost.count();
    console.log(`\nBlogPost table has ${count} entries`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
