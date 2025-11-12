/*
  Prisma seed script: populate basic Projects and BlogPost data so the landing page
  can read from the backend instead of local mocks.

  Usage:
    - Ensure DATABASE_URL is set and migrations are applied
    - npm run prisma:migrate
    - npm run prisma:seed  (or: npx prisma db seed)
*/
import { PrismaClient, ProjectStatus, ProjectType, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedProject = {
  id: string;
  name: string;
  type: ProjectType;
  location: string;
  start: string; // ISO date
  status: ProjectStatus;
  budget: number;
  collected?: number;
  spent?: number;
  shortDescription?: string;
  longDescription?: string;
  coverImage?: string;
  organisation?: string;
  operators?: string[];
  primaryOperator?: string;
};

const projects: SeedProject[] = [
  {
    id: '1',
    name: 'Menstrual Health Kit Production & Distribution',
    type: 'DISTRIBUTION',
    location: 'Kisumu County, Kenya',
    start: '2024-02-10T00:00:00Z',
    status: 'ACTIVE',
    budget: 48000,
    collected: 31000,
    spent: 0,
    shortDescription:
      'Training local women to sew reusable menstrual hygiene kits and distributing 1,200 dignity packs to school girls with tracking of usage and retention.',
    coverImage: '/images/placeholder-water.svg',
    organisation: 'Educate4Dignity',
    operators: ['SaCoDé'],
    primaryOperator: 'SaCoDé',
  },
  {
    id: '2',
    name: 'School Menstrual Health Education & Facilities',
    type: 'TRAINING',
    location: 'Ashanti Region, Ghana',
    start: '2024-03-05T00:00:00Z',
    status: 'ACTIVE',
    budget: 30000,
    collected: 20500,
    spent: 0,
    shortDescription:
      'Implementing participatory menstrual health curriculum in 15 schools, training 30 female facilitators and upgrading 10 girl-friendly washrooms.',
    coverImage: '/images/placeholder-literacy.svg',
    organisation: 'Educate4Dignity',
    operators: ['Local Schools'],
    primaryOperator: 'Local Schools',
  },
  {
    id: '3',
    name: 'Adolescent Menstrual Health Impact Study',
    type: 'R_AND_D',
    location: 'Amhara & Oromia, Ethiopia',
    start: '2024-06-10T00:00:00Z',
    status: 'DRAFT',
    budget: 52000,
    collected: 6000,
    spent: 0,
    shortDescription:
      'Mixed-method research measuring school attendance, confidence, and health outcomes post kit distribution & education sessions across 5 districts.',
    coverImage: '/images/placeholder-generic.svg',
    organisation: 'Educate4Dignity',
  },
];

type SeedBlog = {
  slug: string;
  title: string;
  author: string;
  summary: string;
  contentHtml: string;
  coverImageUrl?: string;
  category?: string;
  tags?: string[];
  readMinutes?: number;
  publishedAt?: string; // ISO
  status?: string;
};

// Lightweight Markdown -> HTML converter for seed content (bold, italic, links, basic paragraphs)
const mdToHtml = (md: string) => {
  let s = (md || '').trim();
  // Bold and italics
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Simple links [text](url)
  s = s.replace(/\[([^\]]+)\]\((https?:[^\s)]+|\/[\w\-\/.#?=&%]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1<\/a>');
  // Split paragraphs and line breaks
  s = s.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>');
  return `<p>${s}</p>`;
};

const blogs: SeedBlog[] = [
  {
    slug: 'from-absenteeism-to-attendance',
    title: 'From absenteeism to attendance: reusable kits at school',
    author: 'E4D Ops',
    coverImageUrl: '/photos/Dossier/02.png',
    summary: 'Amina’s story: a simple reusable kit, practical training, and the missed days stopped.',
    contentHtml: mdToHtml(`In many rural parts of Africa, hardship shows up in the small details of daily life. Water is sometimes far away, school latrines lack privacy, and a family budget can’t always cover disposable pads. In Burundi, one pad often costs the equivalent of a meal. When market prices rise, priorities shift and girls stay home during their periods.

Amina used to miss the first week of every month. She feared stains on her uniform, teasing, and failed quizzes. With each absence, she drifted further to the back of the classroom. Her world was shrinking with the calendar.

The day the school handed out a reusable kit, everything changed. Several washable pads, a breathable pouch, a simple guide for discreet washing and drying. A teacher led a hands‑on session. They talked about hygiene, pain, and planning. Myths gave way to clear, practical steps.

The following month, Amina was in class all week. She raised her hand, rejoined the science club, and went home proud of her grades. The kit eased the family budget, reduced waste, and gave learning time back. It’s a small solution that fits the local reality.

<strong>$25 keeps a girl in school all year.</strong> Your gift funds a durable kit, an education session, and simple follow‑up. You turn a lost week into filled pages, and you support local jobs for the seamstresses who make these kits.`),
    tags: ['MHM', 'Attendance', 'Case study'],
    readMinutes: 6,
    publishedAt: '2024-10-15T00:00:00Z',
    status: 'published',
  },
  {
    slug: 'coops-women-led-production',
    title: '“No more stigma. Just dignity.”',
    author: 'Esperance',
    coverImageUrl: '/photos/Dossier/Generated Image October 02, 2025 - 8_50AM (1).png',
    summary: 'In a displacement site near Goma, a simple hygiene corner and a reusable kit brought school and dignity back.',
    contentHtml: mdToHtml(`On the outskirts of Goma, Esperance lives in a displacement site where water arrives in rotations and latrines are shared. When her period starts, she often stays under the tent. She fears leaks, smell, and teasing. The school is close, but dignity feels far away.

One morning, a mobile team sets up a small “hygiene corner” at the school. A bucket with a tap, soap, a line for discreet drying, and above all a reusable kit with a breathable pouch. The session is short and practical. They show how to use, wash, and dry everything discreetly. They also talk about cramps and intimate hygiene without judgment.

The administration reserves a discreet locker and a sign-in log so students can access the hygiene corner without drawing attention. Two peer mentors explain cycle tracking and a few simple ways to manage pain. On Saturdays, a short Swahili radio segment recaps the guidance for those who missed the session.

By the next month, Esperance is back in class all week. She sits closer to the board, joins the debate club, and no longer avoids group work. At home, the household budget eases, there’s less waste, and more peace of mind. She smiles and sums it up in one line: no more shame, just dignity.`),
    tags: ['MHM', 'Displacement', 'Hygiene corner'],
    readMinutes: 6,
    publishedAt: '2024-04-12T00:00:00Z',
    status: 'published',
  },
  {
    slug: 'training-day-mhm-basics',
    title: '“My daughter now has confidence.”',
    author: 'Grace',
    coverImageUrl: '/photos/Dossier/Generated Image October 02, 2025 - 8_39AM.png',
    summary: 'A mother’s perspective on how a reusable kit and teacher talks restored confidence at home and at school.',
    contentHtml: mdToHtml(`Grace remembers her daughter speaking in a low voice about her period. She avoided sports, asked to go home early, and feared leaks. In the evening, the mother felt powerless. She watched shyness take over and the desire to learn fade.

The reusable kit changed their routine. During a teacher-led session, a nurse explained how to use, wash, and dry everything safely. They covered pain management, how often to change, and how to plan the cycle. Understanding replaced fear.

At home, the pouch now hangs on a discreet hook. Washing fits into the family routine without embarrassment. At school, the girl sits in the front row, takes part in activities, and is back on the sports field. Her look has changed, her back is straight.

Around them, the ripple effect is clear. Neighbors ask questions, classmates share tips, and the teacher reinforces a message of respect. The kit costs less over time and avoids extra waste. Confidence, savings, and the environment advance together.`),
    tags: ['Confidence', 'Parent voice', 'MHM'],
    readMinutes: 6,
    publishedAt: '2023-11-05T00:00:00Z',
    status: 'published',
  },
  // Removed three legacy posts by request (local-production-reusable-kits, menstrual-health-education-lycee-buhiga, kit-distribution-next-steps)
];

async function upsertProjects() {
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        type: p.type,
        location: p.location,
        start: new Date(p.start),
        status: p.status,
        budget: p.budget,
        collected: p.collected ?? 0,
        spent: p.spent ?? 0,
        shortDescription: p.shortDescription,
        longDescription: p.longDescription,
        coverImage: p.coverImage,
        organisation: p.organisation || 'Educate4Dignity',
        operators: p.operators || [],
        primaryOperator: p.primaryOperator,
      },
      create: {
        id: p.id,
        name: p.name,
        type: p.type,
        organisation: p.organisation || 'Educate4Dignity',
        orgType: 'NGO',
        location: p.location,
        start: new Date(p.start),
        status: p.status,
        budget: p.budget,
        collected: p.collected ?? 0,
        spent: p.spent ?? 0,
        manager: 'Jessica Luiru',
        shortDescription: p.shortDescription,
        longDescription: p.longDescription,
        coverImage: p.coverImage,
        videoUrl: undefined,
        operators: p.operators || [],
        primaryOperator: p.primaryOperator,
      },
    });
  }
}

async function upsertBlogs() {
  for (const b of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        summary: b.summary,
        contentHtml: b.contentHtml,
        author: b.author,
        coverImageUrl: b.coverImageUrl,
        category: b.category || 'impact',
        tags: b.tags || [],
        readMinutes: b.readMinutes || 5,
        publishedAt: b.publishedAt ? new Date(b.publishedAt) : undefined,
        status: b.status || 'published',
      },
      create: {
        slug: b.slug,
        title: b.title,
        summary: b.summary,
        contentHtml: b.contentHtml,
        author: b.author,
        coverImageUrl: b.coverImageUrl,
        category: b.category || 'impact',
        tags: b.tags || [],
        readMinutes: b.readMinutes || 5,
        publishedAt: b.publishedAt ? new Date(b.publishedAt) : new Date(),
        status: b.status || 'published',
      },
    });
  }
}

async function seedELearning() {
  // One module with three lessons for public display
  const module = await prisma.elearnModule.upsert({
    where: { slug: 'mhm-basics' },
    update: {
      title: 'Menstrual Health Basics',
      summary: 'Practical lessons: understanding periods, hygiene practices, and reusable kit care.'
    },
    create: {
      slug: 'mhm-basics',
      title: 'Menstrual Health Basics',
      summary: 'Practical lessons: understanding periods, hygiene practices, and reusable kit care.'
    }
  });

  const lessons = [
    {
      slug: 'intro-understanding-periods',
      title: 'Understanding periods',
      order_index: 1,
      html: mdToHtml('What is menstruation? Why does it matter to talk about it openly? Myths and facts.'),
      level: 'Beginner',
      durationMinutes: 6,
      tags: ['intro','mhm'] as string[],
    },
    {
      slug: 'safe-hygiene-practices',
      title: 'Safe hygiene practices',
      order_index: 2,
      html: mdToHtml('Washing hands, changing frequency, privacy tips at school and at home.'),
      level: 'Beginner',
      durationMinutes: 8,
      tags: ['hygiene','school'] as string[],
    },
    {
      slug: 'reusable-kit-care',
      title: 'Reusable kit care',
      order_index: 3,
      html: mdToHtml('How to use, wash, dry, and store a reusable kit discreetly and safely.'),
      level: 'Beginner',
      durationMinutes: 7,
      tags: ['kit','care'] as string[],
    }
  ];

  for (const l of lessons) {
    await prisma.elearnLesson.upsert({
      where: { slug: l.slug },
      update: {
        moduleId: module.id,
        title: l.title,
        html: l.html,
        level: l.level as any,
        durationMinutes: l.durationMinutes,
        tags: l.tags,
        order_index: l.order_index,
      },
      create: {
        slug: l.slug,
        moduleId: module.id,
        title: l.title,
        html: l.html,
        level: l.level as any,
        durationMinutes: l.durationMinutes,
        tags: l.tags,
        order_index: l.order_index,
      }
    });
  }
}

async function seedPlanForProjects() {
  // For each project, if it has no activities yet, seed a minimal plan so the UI isn't blank
  const all = await prisma.project.findMany({ select: { id: true, type: true, organisation: true, operators: true, primaryOperator: true } });
  const today = new Date();
  const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  for (const p of all) {
    const count = await prisma.activity.count({ where: { projectId: p.id } });
    if (count > 0) continue;
    const assigneeTeam = p.primaryOperator || (p.operators && p.operators[0]) || p.organisation || 'Equipe projet';
    if (p.type === 'DISTRIBUTION') {
      const a1 = await prisma.activity.create({ data: {
        projectId: p.id,
        title: 'Confirmer fournisseurs et quantités',
        status: 'TODO',
        assignee: assigneeTeam,
        assigneeType: 'achat',
        category: 'achat',
        startDate: addDays(1),
        endDate: addDays(7),
        due: addDays(8),
        priority: 'high',
      }});
      const a2 = await prisma.activity.create({ data: {
        projectId: p.id,
        title: 'Production lots P-01 à P-04',
        status: 'TODO',
        assignee: assigneeTeam,
        assigneeType: 'producteur',
        category: 'production',
        startDate: addDays(3),
        endDate: addDays(14),
        due: addDays(15),
        priority: 'medium',
        plannedBudget: 20000,
      }});
      await prisma.activity.create({ data: {
        projectId: p.id,
        title: 'Distribution vague 1',
        status: 'TODO',
        assignee: assigneeTeam,
        assigneeType: 'distributeur',
        category: 'distribution',
        startDate: addDays(10),
        endDate: addDays(20),
        due: addDays(21),
        priority: 'medium',
      }});
      await prisma.milestone.create({ data: {
        projectId: p.id,
        activityId: a2.id,
        label: 'P-01 — 2 000 kits produits',
        targetDate: addDays(12),
        status: 'ON_TRACK',
        progress: 25,
        type: 'production',
      }});
    } else if (p.type === 'TRAINING') {
      const a1 = await prisma.activity.create({ data: {
        projectId: p.id,
        title: 'Former 30 formateurs locaux',
        status: 'TODO',
        assignee: assigneeTeam,
        assigneeType: 'formateur',
        category: 'formation',
        startDate: addDays(2),
        endDate: addDays(9),
        due: addDays(10),
        priority: 'high',
        sessionsPlanned: 5,
        kpiUnit: 'sessions',
        kpiTargetValue: 5,
      }});
      await prisma.milestone.create({ data: {
        projectId: p.id,
        activityId: a1.id,
        label: 'Session pilote complétée',
        targetDate: addDays(12),
        status: 'NOT_STARTED',
        type: 'formation',
      }});
      await prisma.activity.create({ data: {
        projectId: p.id,
        title: 'Session pilote dans 3 écoles',
        status: 'TODO',
        assignee: assigneeTeam,
        assigneeType: 'formateur',
        category: 'formation',
        startDate: addDays(12),
        endDate: addDays(18),
        due: addDays(19),
        priority: 'medium',
      }});
    } else if (p.type === 'R_AND_D') {
      await prisma.activity.create({ data: {
        projectId: p.id,
        title: 'Définir hypothèses et protocole',
        status: 'TODO',
        assignee: assigneeTeam,
        assigneeType: 'r&d',
        category: 'recherche_dev',
        startDate: addDays(2),
        endDate: addDays(12),
        due: addDays(13),
        priority: 'medium',
      }});
    }
  }
}

async function seedWorkflowData() {
  // Deterministic test data to exercise all workflows (activities, milestones, expenses, reports, beneficiaries)
  const projs = await prisma.project.findMany({ select: { id: true, type: true, organisation: true, operators: true, primaryOperator: true } });
  const today = new Date();
  const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  for (const p of projs) {
    const assigneeTeam = p.primaryOperator || (p.operators && p.operators[0]) || p.organisation || 'Equipe projet';

    // --- Activities (4 statuses)
    const acts = [
      { id: `A-${p.id}-01`, title: 'Kickoff & cadrage', status: 'TODO' as const, assigneeType: 'chef de projet', category: 'hybride', start: 1, end: 4, due: 5, priority: 'high' },
      { id: `A-${p.id}-02`, title: 'Approvisionnement matières', status: 'IN_PROGRESS' as const, assigneeType: 'achat', category: 'achat', start: 2, end: 8, due: 9, priority: 'medium', plannedBudget: 12000 },
      { id: `A-${p.id}-03`, title: 'Production lot pilote', status: 'BLOCKED' as const, assigneeType: 'producteur', category: 'production', start: 6, end: 15, due: 16, priority: 'medium' },
      { id: `A-${p.id}-04`, title: 'Distribution vague pilote', status: 'DONE' as const, assigneeType: 'distributeur', category: 'distribution', start: -10, end: -5, due: -4, priority: 'low' },
    ];
    for (const a of acts) {
      await prisma.activity.upsert({
        where: { id: a.id },
        update: {
          projectId: p.id,
          title: a.title,
          status: a.status as any,
          assignee: assigneeTeam,
          assigneeType: a.assigneeType,
          category: a.category,
          startDate: addDays(a.start),
          endDate: addDays(a.end),
          due: addDays(a.due),
          priority: a.priority,
          plannedBudget: a.plannedBudget ?? undefined,
        },
        create: {
          id: a.id,
          projectId: p.id,
          title: a.title,
          status: a.status as any,
          assignee: assigneeTeam,
          assigneeType: a.assigneeType,
          category: a.category,
          startDate: addDays(a.start),
          endDate: addDays(a.end),
          due: addDays(a.due),
          priority: a.priority,
          plannedBudget: a.plannedBudget ?? undefined,
        },
      });
    }

    // --- Milestones linked to activities
    const mls = [
      { id: `M-${p.id}-01`, activityId: acts[1].id, label: 'PO émis & confirmé', target: 7, status: 'ON_TRACK' as const, type: 'achat' },
      { id: `M-${p.id}-02`, activityId: acts[2].id, label: 'Prototype V1 validé', target: 12, status: 'AT_RISK' as const, type: 'production', risk: 'medium' },
      { id: `M-${p.id}-03`, activityId: acts[3].id, label: 'Vague pilote livrée', target: -4, status: 'COMPLETED' as const, type: 'distribution', completed: -3 },
    ];
    for (const m of mls) {
      await prisma.milestone.upsert({
        where: { id: m.id },
        update: {
          projectId: p.id,
          activityId: m.activityId,
          label: m.label,
          targetDate: addDays(m.target),
          status: m.status as any,
          type: m.type,
          risk: (m.risk || undefined) as any,
          completedOn: typeof m.completed === 'number' ? addDays(m.completed) : undefined,
        },
        create: {
          id: m.id,
          projectId: p.id,
          activityId: m.activityId,
          label: m.label,
          targetDate: addDays(m.target),
          status: m.status as any,
          type: m.type,
          risk: (m.risk || undefined) as any,
          completedOn: typeof m.completed === 'number' ? addDays(m.completed) : undefined,
        },
      });
    }

    // --- Expenses (various categories, currencies, statuses)
    const exps = [
      { id: `E-${p.id}-01`, cat: 'ADMIN', method: 'CASH', ccy: 'USD', amt: 150, fx: null, status: 'DRAFT', act: acts[0].id },
      { id: `E-${p.id}-02`, cat: 'PROCUREMENT', method: 'BANK_TRANSFER', ccy: 'USD', amt: 4200, fx: null, status: 'SUBMITTED', act: acts[1].id },
      { id: `E-${p.id}-03`, cat: 'LOGISTICS', method: 'MOBILE_MONEY', ccy: 'BIF', amt: 1800000, fx: 0.00035, status: 'APPROVED', act: acts[3].id, ms: mls[2].id },
      { id: `E-${p.id}-04`, cat: 'TRAINING', method: 'CASH', ccy: 'USD', amt: 300, fx: null, status: 'REJECTED', act: acts[0].id },
    ];
    for (const e of exps) {
      await prisma.expense.upsert({
        where: { id: e.id as string },
        update: {
          projectId: p.id,
          activityId: e.act as string,
          milestoneId: (e as any).ms || undefined,
          category: (e.cat as any),
          date: addDays(-2),
          description: 'Dépense test',
          payee: 'Fournisseur X',
          method: (e.method as any),
          currency: e.ccy as string,
          amount: e.amt as number,
          fx: (e.fx as number|null) || undefined,
          status: (e.status as any),
          attachment: 'doc.pdf',
        },
        create: {
          id: e.id as string,
          projectId: p.id,
          activityId: e.act as string,
          milestoneId: (e as any).ms || undefined,
          category: (e.cat as any),
          date: addDays(-2),
          description: 'Dépense test',
          payee: 'Fournisseur X',
          method: (e.method as any),
          currency: e.ccy as string,
          amount: e.amt as number,
          fx: (e.fx as number|null) || undefined,
          status: (e.status as any),
          attachment: 'doc.pdf',
        },
      });
    }

    // --- Reports (submitted/approved/final)
    const reps = [
      { id: `R-${p.id}-01`, type:'MONTHLY', status:'SUBMITTED', author:'acteur', submittedAt: -1, period: '2024-09' },
      { id: `R-${p.id}-02`, type:'MILESTONE', status:'APPROVED', author:'admin', submittedAt: -5, milestoneId: mls[2].id },
      { id: `R-${p.id}-03`, type:'FINAL', status:'REJECTED', author:'admin', submittedAt: -3 },
    ];
    for (const r of reps) {
      await prisma.report.upsert({
        where: { id: r.id },
        update: {
          projectId: p.id,
          type: (r.type as any),
          period: r.period || undefined,
          milestoneId: r.milestoneId as any,
          activityId: undefined,
          author: r.author,
          submittedAt: addDays(r.submittedAt),
          status: (r.status as any),
          file: 'rapport.pdf',
        },
        create: {
          id: r.id,
          projectId: p.id,
          type: (r.type as any),
          period: r.period || undefined,
          milestoneId: r.milestoneId as any,
          activityId: undefined,
          author: r.author,
          submittedAt: addDays(r.submittedAt),
          status: (r.status as any),
          file: 'rapport.pdf',
        },
      });
    }

    // --- Beneficiaries (two rows)
    const bens = [
      { id: `B-${p.id}-01`, date: -20, type: p.type === 'TRAINING' ? 'TRAINING' : 'DISTRIBUTION', females: 120, males: 30, notes: 'Session A' },
      { id: `B-${p.id}-02`, date: -5, type: p.type === 'TRAINING' ? 'TRAINING' : 'DISTRIBUTION', females: 180, males: 40, notes: 'Session B' },
    ];
    for (const b of bens) {
      await prisma.beneficiary.upsert({
        where: { id: b.id },
        update: {
          projectId: p.id,
          date: addDays(b.date),
          type: (b.type as any),
          females: b.females,
          males: b.males,
          notes: b.notes,
          file: 'beneficiaires.csv',
        },
        create: {
          id: b.id,
          projectId: p.id,
          date: addDays(b.date),
          type: (b.type as any),
          females: b.females,
          males: b.males,
          notes: b.notes,
          file: 'beneficiaires.csv',
        },
      });
    }
  }
}

async function main() {
  // Ensure a dev admin user exists for local testing of admin endpoints
  const adminEmail = 'admin@e4d.test';
  const adminPass = 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: hash, name: 'Dev Admin' },
  });
  // Assign ADMIN role if missing
  await prisma.userRole.upsert({
    where: { userId_roleName: { userId: admin.id, roleName: RoleName.ADMIN } },
    update: {},
    create: { userId: admin.id, roleName: RoleName.ADMIN },
  });

  await upsertProjects();
  await upsertBlogs();
  await seedELearning();
  await seedPlanForProjects();
  await seedWorkflowData();
  // Seed a few public resources for development/demo
  await (prisma as any).resource.upsert({
    where: { slug: 'annual-report-2024' },
    update: {},
    create: {
      slug: 'annual-report-2024',
      title: 'Annual Report 2024',
      summary: 'Full-year outcomes, delivery rates, and audited statements.',
      category: 'report',
      year: 2024,
      language: 'EN',
      fileType: 'PDF',
      fileSizeBytes: 2200000,
      url: 'https://example.com/annual-report-2024.pdf',
      tags: ['impact','finance'],
      status: 'published',
      visibility: 'public',
      publishedAt: new Date(),
    }
  });
  await (prisma as any).resource.upsert({
    where: { slug: 'policy-data-privacy' },
    update: {},
    create: {
      slug: 'policy-data-privacy',
      title: 'Policy: Data Privacy',
      summary: 'How we anonymize beneficiary data & manage consent.',
      category: 'policy',
      year: 2025,
      language: 'EN/FR',
      fileType: 'PDF',
      fileSizeBytes: 480000,
      url: 'https://example.com/policy-data-privacy.pdf',
      tags: ['privacy','consent'],
      status: 'published',
      visibility: 'public',
      publishedAt: new Date(),
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Seed completed');
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
