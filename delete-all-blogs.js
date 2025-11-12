const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Deleting old blogs...');
    const deleted = await prisma.blogPost.deleteMany({});
    console.log(`Deleted ${deleted.count} blogs\n`);
    
    console.log('Now run: npx ts-node prisma/seed-blogs.ts');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
