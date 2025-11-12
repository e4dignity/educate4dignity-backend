import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Convertir Markdown en HTML simple (pour le contenu)
function markdownToHtml(md: string): string {
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

async function seedBlogs() {
  console.log('🌱 Seeding blog posts...');

  // Les 3 articles de blog basés sur les données mockées
  const blogs = [
    {
      slug: 'from-absenteeism-to-attendance',
      title: 'From absenteeism to attendance: reusable kits at school',
      summary: 'What changed when girls received training and reusable kits.',
      excerpt: "Amina's story: a simple reusable kit, practical training, and the missed days stopped.",
      category: 'impact',
      tags: ['MHM', 'Attendance', 'Case study'],
      author: 'E4D Ops',
      authorRole: 'Training & Distribution',
      authorBio: 'We partner with local schools and women-led cooperatives to deliver MHM training and reusable kits.',
      authorAvatarUrl: null,
      // TODO: Upload to Cloudinary et remplacer par l'URL réelle
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/educate4dignity/blog-absenteeism-to-attendance.jpg',
      coverConsentVerified: true,
      readMinutes: 6,
      publishedAt: new Date('2024-10-15'),
      contentMarkdown: `In many rural parts of Africa, hardship shows up in the small details of daily life. Water is sometimes far away, school latrines lack privacy, and a family budget can't always cover disposable pads. In Burundi, one pad often costs the equivalent of a meal. When market prices rise, priorities shift and girls stay home during their periods.

Amina used to miss the first week of every month. She feared stains on her uniform, teasing, and failed quizzes. With each absence, she drifted further to the back of the classroom. Her world was shrinking with the calendar.

The day the school handed out a reusable kit, everything changed. Several washable pads, a breathable pouch, a simple guide for discreet washing and drying. A teacher led a hands-on session. They talked about hygiene, pain, and planning. Myths gave way to clear, practical steps.

The following month, Amina was in class all week. She raised her hand, rejoined the science club, and went home proud of her grades. The kit eased the family budget, reduced waste, and gave learning time back. It's a small solution that fits the local reality.

**$25 keeps a girl in school all year.** Your gift funds a durable kit, an education session, and simple follow-up. You turn a lost week into filled pages, and you support local jobs for the seamstresses who make these kits.`,
      calloutTransparency: 'Photos are illustrative. Attendance insights are aggregated; we do not publish personally identifiable data.',
      relatedSlugs: ['training-day-mhm-basics', 'coops-women-led-production'],
      seoTitle: 'From absenteeism to attendance — impact notes',
      seoDescription: 'Practical MHM training and reusable kits can reduce missed lessons and improve comfort.',
      status: 'published',
    },
    {
      slug: 'coops-women-led-production',
      title: '"No more stigma. Just dignity."',
      summary: 'In a displacement site near Goma, a simple hygiene corner and a reusable kit brought school and dignity back.',
      excerpt: 'In a displacement site near Goma, a simple hygiene corner and a reusable kit brought school and dignity back.',
      category: 'impact',
      tags: ['MHM', 'Displacement', 'Hygiene corner'],
      author: 'Esperance',
      authorRole: 'Student (DRC)',
      authorBio: null,
      authorAvatarUrl: null,
      // TODO: Upload to Cloudinary et remplacer par l'URL réelle
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/educate4dignity/blog-no-more-stigma.jpg',
      coverConsentVerified: true,
      readMinutes: 6,
      publishedAt: new Date('2024-04-12'),
      contentMarkdown: `On the outskirts of Goma, Esperance lives in a displacement site where water arrives in rotations and latrines are shared. When her period starts, she often stays under the tent. She fears leaks, smell, and teasing. The school is close, but dignity feels far away.

One morning, a mobile team sets up a small "hygiene corner" at the school. A bucket with a tap, soap, a line for discreet drying, and above all a reusable kit with a breathable pouch. The session is short and practical. They show how to use, wash, and dry everything discreetly. They also talk about cramps and intimate hygiene without judgment.

The administration reserves a discreet locker and a sign-in log so students can access the hygiene corner without drawing attention. Two peer mentors explain cycle tracking and a few simple ways to manage pain. On Saturdays, a short Swahili radio segment recaps the guidance for those who missed the session.

By the next month, Esperance is back in class all week. She sits closer to the board, joins the debate club, and no longer avoids group work. At home, the household budget eases, there's less waste, and more peace of mind. She smiles and sums it up in one line: no more shame, just dignity.

Help provide reusable kits, set up a hygiene corner, and deliver education sessions. Each action protects a girl's schooling in fragile settings and strengthens her knowledge and confidence month after month.`,
      calloutTransparency: 'Context and names adapted for privacy; photos illustrative with consent where shown.',
      relatedSlugs: ['from-absenteeism-to-attendance', 'training-day-mhm-basics'],
      seoTitle: 'Dignity restored in a displacement setting - Esperance story',
      seoDescription: 'A hygiene corner, clear guidance, and a reusable kit helped Esperance return to class with confidence.',
      status: 'published',
    },
    {
      slug: 'training-day-mhm-basics',
      title: '"My daughter now has confidence."',
      summary: "A mother perspective on how a reusable kit and teacher talks restored confidence at home and at school.",
      excerpt: "A mother perspective on how a reusable kit and teacher talks restored confidence at home and at school.",
      category: 'impact',
      tags: ['Confidence', 'Parent voice', 'MHM'],
      author: 'Grace',
      authorRole: 'Parent (Rwanda)',
      authorBio: null,
      authorAvatarUrl: null,
      // TODO: Upload to Cloudinary et remplacer par l'URL réelle
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/educate4dignity/blog-daughter-confidence.jpg',
      coverConsentVerified: true,
      readMinutes: 6,
      publishedAt: new Date('2023-11-05'),
      contentMarkdown: `Grace remembers her daughter speaking in a low voice about her period. She avoided sports, asked to go home early, and feared leaks. In the evening, the mother felt powerless. She watched shyness take over and the desire to learn fade.

The reusable kit changed their routine. During a teacher-led session, a nurse explained how to use, wash, and dry everything safely. They covered pain management, how often to change, and how to plan the cycle. Understanding replaced fear.

At home, the pouch now hangs on a discreet hook. Washing fits into the family routine without embarrassment. At school, the girl sits in the front row, takes part in activities, and is back on the sports field. Her look has changed, her back is straight.

Around them, the ripple effect is clear. Neighbors ask questions, classmates share tips, and the teacher reinforces a message of respect. The kit costs less over time and avoids extra waste. Confidence, savings, and the environment advance together.

Your gift funds reusable kits and teacher talks. Give today. Help a mother see her daughter walk with her head held high and stay fully engaged in her studies.`,
      calloutTransparency: 'Photos illustrative; quotes paraphrased with consent when applicable.',
      relatedSlugs: ['from-absenteeism-to-attendance', 'coops-women-led-production'],
      seoTitle: 'Parent voice — confidence returns with clear steps',
      seoDescription: "A mother's story: training and a reusable kit turned fear into confidence at home and in class.",
      status: 'published',
    },
  ];

  for (const blog of blogs) {
    const contentHtml = markdownToHtml(blog.contentMarkdown);
    
    // Use createMany with skipDuplicates instead of upsert to avoid UUID issues
    await prisma.blogPost.create({
      data: {
        slug: blog.slug,
        title: blog.title,
        summary: blog.summary,
        excerpt: blog.excerpt,
        contentHtml,
        contentMarkdown: blog.contentMarkdown,
        author: blog.author,
        authorRole: blog.authorRole,
        authorBio: blog.authorBio,
        authorAvatarUrl: blog.authorAvatarUrl,
        coverImageUrl: blog.coverImageUrl,
        coverConsentVerified: blog.coverConsentVerified,
        category: blog.category,
        tags: blog.tags,
        readMinutes: blog.readMinutes,
        publishedAt: blog.publishedAt,
        calloutTransparency: blog.calloutTransparency,
        relatedSlugs: blog.relatedSlugs,
        seoTitle: blog.seoTitle,
        seoDescription: blog.seoDescription,
        status: blog.status,
      },
    });

    console.log(`✅ Blog seeded: ${blog.title}`);
  }

  console.log('✨ Blog seeding completed!');
}

async function main() {
  try {
    await seedBlogs();
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
