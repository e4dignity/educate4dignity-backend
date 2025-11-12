const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Checking blogs in database...\n');
    const blogs = await prisma.blogPost.findMany({
      select: {
        slug: true,
        title: true,
        author: true,
        status: true,
        publishedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`Found ${blogs.length} blogs:\n`);
    blogs.forEach((blog, i) => {
      console.log(`${i + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Author: ${blog.author}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Published: ${blog.publishedAt}\n`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
