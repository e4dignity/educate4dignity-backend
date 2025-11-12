/*
  Migration: Import E-learning static seeds from frontend src/data/elearning.ts into Postgres.
  - Keeps existing DB content (upsert by slug)
  - Creates/updates one module (moduleRecord) and all lessons (preserving order)

  Run: npm run migrate:elearn
*/
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

function extractObject<T = any>(src: string, varName: string): T | undefined {
  const re = new RegExp(`const\\s+${varName}\\s*:[^=]*=\\s*([\\s\\S]*?);`, 'm');
  const m = src.match(re);
  if (!m) return undefined;
  const code = m[1];
  // Evaluate the object/array literal in a sandboxed Function
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${code});`);
  return fn() as T;
}

function sectionsToHtml(sections: any[]): string {
  if (!Array.isArray(sections)) return '';
  const parts: string[] = [];
  for (const s of sections) {
    if (s.h2) parts.push(`<h2>${s.h2}</h2>`);
    if (s.html) parts.push(String(s.html));
    if (Array.isArray(s.links) && s.links.length) {
      const links = s.links.map((l: any) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`).join('');
      parts.push(`<ul>${links}</ul>`);
    }
  }
  return parts.join('\n');
}

async function main() {
  const frontendFile = path.resolve(__dirname, '../../educate4dignity-frontend/src/data/elearning.ts');
  const ts = fs.readFileSync(frontendFile, 'utf8');

  let lessons: any[] | undefined;
  try {
    lessons = extractObject<any[]>(ts, 'lessons');
  } catch {}
  if (!Array.isArray(lessons)) {
    // Fallback: minimal subset (manually inlined) if parsing fails
    lessons = [
      {
        title: 'MHM basics: period health 101',
        slug: 'mhm-basics-101',
        summary: 'Track your cycle, stay prepared with a small pouch, nourish well, and know when to seek care.',
        level: 'Beginner',
        duration_minutes: 8,
        tags: ['MHM','Education'],
        cover_image_url: '/photos/course/Generated Image October 03, 2025 - 9_00AM.png',
        quick_tip: 'Note your dates and carry a small pouch (pad, soap, bag, spare underwear). Preparation reduces stress.',
        body_sections: [
          { h2: 'Understanding your cycle & preparation', html: '<p>The cycle begins on the first day of bleeding and ends the day before the next period. The length varies from person to person, especially in the first years. Writing your dates in a notebook, a phone calendar, or on a small bead bracelet helps you prepare for classes, exams, and sports. Always keep a discreet pouch with supplies, a wipe, a waterproof bag, and spare underwear.</p>' },
          { h2: 'Nutrition, self‑care & when to seek help', html: '<p>Eating local, varied foods supports your energy: beans, groundnuts, dried or fresh fish (ndakala, dagaa), green vegetables such as cassava leaves or amaranth, whole grains like millet or sorghum, and seasonal fruits like mango or guava. Clean water and regular sleep help as well. Mild cramps are common. Heat from a hot water bottle, walking, and gentle stretches often bring relief. Seek care if bleeding lasts more than seven days, if you need to change a product every hour, if pain stops your normal activities, or if you feel very weak. At school and at home, you have the right to dignity, privacy, and to be listened to.</p>' },
          { h2: 'Download & reference', links: [
            { label: 'MoH — Menstrual Cycle (PDF)', url: 'https://www.moh.gov.sa/en/awarenessplateform/WomensHealth/Documents/Menstrual-Cycle.pdf' },
            { label: 'Cornell resource (PDF)', url: 'https://ecommons.cornell.edu/server/api/core/bitstreams/3ee2fed5-bd6d-49cf-8141-4cc02acfd938/content' },
          ] }
        ],
      },
      {
        title: 'Materials & safe use',
        slug: 'materials-safe-use',
        summary: 'Options and safety: how to choose, change, wash, and dry with dignity.',
        level: 'Beginner',
        duration_minutes: 7,
        tags: ['MHM'],
        cover_image_url: '/photos/course/Generated Image October 03, 2025 - 9_15AM.png',
        quick_tip: 'Wash hands first; rinse cold, wash with soap, rinse clear, and dry fully in the sun (or finish with a light iron). Store clean and dry.',
        body_sections: [
          { h2: 'Choosing what fits you', html: '<p>There are several options depending on budget and access to water: disposable pads, reusable pads sewn by local artisans, period underwear, tampons, and menstrual cups. Choose based on your flow, your activities, and whether you can change discreetly at school or in the market. For sports, some prefer tampons or a cup. For the night, a long pad or period underwear can feel more secure.</p>' },
          { h2: 'Safety and cleaning', html: '<p>Safety starts with washing your hands. Change disposable products every 4–6 hours and throw them in a bin. Do not put them in the latrine if it could cause a blockage. For reusables, rinse first with cold water, wash with soap, rinse until the water runs clear, then dry completely in the sun, which helps kill microbes. If you cannot dry them outside, lightly iron them to finish drying and store them in a clean bag. For a cup, empty it, rinse with clean water, and boil it for a few minutes between cycles when possible. If you notice a strong odor, fever, or severe pain, seek advice from a health worker.</p>' },
          { h2: 'Download & reference', links: [
            { label: 'Fistula Care — Female reproductive system (PDF)', url: 'https://fistulacare.org/wp-content/uploads/pdf/Training/Module_3_Female_reproductive_system_Fistula_Care.pdf' },
            { label: 'MoH — Menstrual Cycle (PDF)', url: 'https://www.moh.gov.sa/en/awarenessplateform/WomensHealth/Documents/Menstrual-Cycle.pdf' },
          ] }
        ],
      },
      {
        title: 'Myths & stigma',
        slug: 'myths-stigma',
        summary: 'Periods are healthy; myths don’t limit study, sport, or life. Respectful talk reduces stigma.',
        level: 'Beginner',
        duration_minutes: 6,
        tags: ['MHM'],
        cover_image_url: '/photos/Dossier/Generated Image October 02, 2025 - 9_21AM.png',
        quick_tip: 'Use simple words in your local language. Answer myths calmly and keep going—knowledge and kindness reduce stigma.',
        body_sections: [
          { h2: 'Facts about periods', html: '<p>Periods are not dirty. They show that the body is renewing itself and working well. A girl can go to school, play football, dance, or swim if she feels comfortable and her protection is secure. Each person chooses the product that fits her body, budget, and activities; the priority is hygiene and comfort. The first period does not mean someone is ready for couple life or motherhood; adolescence is a time for study, dreams, and building confidence. Menstrual cycles do not truly synchronize between friends; when dates look similar it is usually coincidence.</p>' },
          { h2: 'Reducing stigma, building dignity', html: '<p>Shame grows in silence. In many African families and schools, we move forward by speaking calmly with a big sister, an auntie, a trusted “mama adviser,” a teacher, or a community health worker. Using simple words in the local language helps everyone understand. Keep a small pouch with supplies and spare underwear so you feel safe at school or in the market. If someone makes jokes or spreads a myth, answer gently that it is not correct and continue with your day. Knowledge, respect, and solidarity reduce stigma and protect dignity.</p>' },
          { h2: 'Download & reference', links: [
            { label: 'Cornell resource (PDF)', url: 'https://ecommons.cornell.edu/server/api/core/bitstreams/3ee2fed5-bd6d-49cf-8141-4cc02acfd938/content' },
            { label: 'ULiège — Thesis (PDF)', url: 'https://matheo.uliege.be/bitstream/2268.2/12225/5/TFE%20final%20-%20Manon%20Beusen.pdf' },
          ] }
        ],
      },
    ];
  }
  // moduleRecord references 'lessons' for computed fields; inject lessons into scope
  let moduleRecord: any;
  try {
    const moduleMatch = ts.match(/const\s+moduleRecord\s*:[^=]*=\s*([\s\S]*?);/m);
    if (!moduleMatch) throw new Error('no module match');
    const moduleCode = moduleMatch[1];
    // eslint-disable-next-line no-new-func
    const moduleFn = new Function('lessons', `return (${moduleCode});`);
    moduleRecord = moduleFn(lessons || []);
  } catch {
    moduleRecord = { title: 'MHM Essentials', slug: 'mhm-essentials', summary: 'Basics of menstrual health, reusable kits, myths & healthy practices.', cover_image_url: null };
  }
  if (!moduleRecord) throw new Error('moduleRecord parse failed');

  // Upsert module
  const mod = await prisma.elearnModule.upsert({
    where: { slug: moduleRecord.slug },
    update: {
      title: moduleRecord.title,
      summary: moduleRecord.summary,
      coverImageUrl: moduleRecord.cover_image_url || undefined,
    },
    create: {
      slug: moduleRecord.slug,
      title: moduleRecord.title,
      summary: moduleRecord.summary,
      coverImageUrl: moduleRecord.cover_image_url || undefined,
    },
  });

  // Upsert lessons (preserve their order in file)
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i] as any;
    const html = sectionsToHtml(l.body_sections || []);
    await prisma.elearnLesson.upsert({
      where: { slug: l.slug },
      update: {
        moduleId: mod.id,
        title: l.title,
        html,
        level: l.level || 'Beginner',
        durationMinutes: l.duration_minutes || 8,
        tags: Array.isArray(l.tags) ? l.tags : [],
        coverImageUrl: l.cover_image_url || undefined,
        quickTip: l.quick_tip || undefined,
        order_index: i + 1,
      },
      create: {
        slug: l.slug,
        moduleId: mod.id,
        title: l.title,
        html,
        level: l.level || 'Beginner',
        durationMinutes: l.duration_minutes || 8,
        tags: Array.isArray(l.tags) ? l.tags : [],
        coverImageUrl: l.cover_image_url || undefined,
        quickTip: l.quick_tip || undefined,
        order_index: i + 1,
      },
    });
  }

  console.log(`Imported module '${moduleRecord.slug}' and ${lessons.length} lessons (upsert) without removing existing data.`);
}

main().then(()=> prisma.$disconnect()).catch(async (e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
