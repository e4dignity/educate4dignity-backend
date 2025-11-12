/*
  Migration script: import sample data from frontend src/mock/db.ts into Postgres via Prisma.

  Usage:
    - DATABASE_URL must point to your Postgres DB (docker-compose sets it)
    - Run: npm run migrate:mock
*/
import 'ts-node/register/transpile-only';
import path from 'node:path';
import { PrismaClient, ActivityStatus, MilestoneStatus, ProjectStatus, ProjectType, ReviewStatus, ReportType, BeneficiaryType, PaymentMethod, ExpenseCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Map helpers (French -> enums)
const mapProjectType = (t: string): ProjectType => ({
  blank: 'BLANK',
  distribution: 'DISTRIBUTION',
  formation: 'TRAINING',
  recherche_dev: 'R_AND_D',
  achat: 'PROCUREMENT',
  hybride: 'HYBRID',
} as Record<string, ProjectType>)[t] ?? 'BLANK';

const mapProjectStatus = (s: string): ProjectStatus => ({
  actif: 'ACTIVE',
  'en pause': 'PAUSED',
  clos: 'CLOSED',
  draft: 'DRAFT',
} as Record<string, ProjectStatus>)[s] ?? 'ACTIVE';

const mapActivityStatus = (s: string): ActivityStatus => ({
  todo: 'TODO',
  in_progress: 'IN_PROGRESS',
  done: 'DONE',
  blocked: 'BLOCKED',
} as any)[s] ?? 'TODO';

const mapMilestoneStatus = (s: string): MilestoneStatus => ({
  not_started: 'NOT_STARTED',
  on_track: 'ON_TRACK',
  at_risk: 'AT_RISK',
  completed: 'COMPLETED',
} as any)[s] ?? 'NOT_STARTED';

const mapReviewStatus = (s: string | undefined): ReviewStatus | undefined => s ? ({
  brouillon: 'DRAFT',
  soumis: 'SUBMITTED',
  validé: 'APPROVED',
  rejeté: 'REJECTED',
} as any)[s] : undefined;

const mapReportType = (t: string): ReportType => ({
  mensuel: 'MONTHLY',
  milestone: 'MILESTONE',
  final: 'FINAL',
} as any)[t] ?? 'MONTHLY';

const mapBeneficiaryType = (t: string): BeneficiaryType => ({
  distribution: 'DISTRIBUTION',
  formation: 'TRAINING',
} as any)[t] ?? 'DISTRIBUTION';

const mapPaymentMethod = (m: string): PaymentMethod => ({
  Cash: 'CASH',
  Virement: 'BANK_TRANSFER',
  Mobile: 'MOBILE_MONEY',
  CB: 'CARD',
} as any)[m] ?? 'CASH';

const mapExpenseCategory = (c: string): ExpenseCategory => ({
  production: 'PRODUCTION',
  distribution: 'DISTRIBUTION',
  formation: 'TRAINING',
  admin: 'ADMIN',
  achat: 'PROCUREMENT',
  transport: 'LOGISTICS',
  logistique: 'LOGISTICS',
} as any)[c] ?? 'ADMIN';

async function main() {
  // Resolve absolute path to frontend mock file
  const frontendMockPath = path.resolve(__dirname, '../../educate4dignity-frontend/src/mock/db.ts');
  const mod = await import(frontendMockPath);
  const db = mod.db as any;

  // Projects
  for (const p of db.projects as any[]) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        type: mapProjectType(p.type),
        organisation: p.organisation,
        orgType: p.orgType || 'organisation',
        location: p.location,
        start: new Date(p.start),
        status: mapProjectStatus(p.status),
        budget: p.budget,
        collected: p.collected,
        spent: p.spent,
        manager: p.manager || undefined,
        shortDescription: p.shortDescription || undefined,
        longDescription: p.longDescription || undefined,
        coverImage: p.coverImage || undefined,
        videoUrl: p.videoUrl || undefined,
        operators: Array.isArray(p.operators) ? p.operators : [],
        primaryOperator: p.primaryOperator || undefined,
      },
      create: {
        id: p.id,
        name: p.name,
        type: mapProjectType(p.type),
        organisation: p.organisation,
        orgType: p.orgType || 'organisation',
        location: p.location,
        start: new Date(p.start),
        status: mapProjectStatus(p.status),
        budget: p.budget,
        collected: p.collected,
        spent: p.spent,
        manager: p.manager || undefined,
        shortDescription: p.shortDescription || undefined,
        longDescription: p.longDescription || undefined,
        coverImage: p.coverImage || undefined,
        videoUrl: p.videoUrl || undefined,
        operators: Array.isArray(p.operators) ? p.operators : [],
        primaryOperator: p.primaryOperator || undefined,
      },
    });
  }

  // Activities
  for (const a of db.projectActivities as any[]) {
    await prisma.activity.upsert({
      where: { id: a.id },
      update: {
        projectId: a.projectId,
        title: a.title,
        description: a.description || undefined,
        assignee: a.assignee || undefined,
        assigneeType: a.assigneeType || undefined,
        status: mapActivityStatus(a.status),
        priority: a.priority || undefined,
        due: a.due ? new Date(a.due) : undefined,
        startDate: a.startDate ? new Date(a.startDate) : undefined,
        endDate: a.endDate ? new Date(a.endDate) : undefined,
        plannedBudget: a.plannedBudget || undefined,
        kpiTargetValue: a.kpiTargetValue || undefined,
        kpiUnit: a.kpiUnit || undefined,
        sessionsPlanned: a.sessionsPlanned || undefined,
        participantsExpectedF: a.participantsExpectedF || undefined,
        participantsExpectedM: a.participantsExpectedM || undefined,
        progress: typeof a.progress === 'number' ? a.progress : undefined,
        category: a.category || a.type || undefined,
        reviewStatus: mapReviewStatus(a.reviewStatus) || undefined,
        submittedBy: a.submittedBy || undefined,
        submittedAt: a.submittedAt ? new Date(a.submittedAt) : undefined,
        reviewedBy: a.reviewedBy || undefined,
        reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : undefined,
        reviewNotes: a.reviewNotes || undefined,
        issues: a.issues || undefined,
      },
      create: {
        id: a.id,
        projectId: a.projectId,
        title: a.title,
        description: a.description || undefined,
        assignee: a.assignee || undefined,
        assigneeType: a.assigneeType || undefined,
        status: mapActivityStatus(a.status),
        priority: a.priority || undefined,
        due: a.due ? new Date(a.due) : undefined,
        startDate: a.startDate ? new Date(a.startDate) : undefined,
        endDate: a.endDate ? new Date(a.endDate) : undefined,
        plannedBudget: a.plannedBudget || undefined,
        kpiTargetValue: a.kpiTargetValue || undefined,
        kpiUnit: a.kpiUnit || undefined,
        sessionsPlanned: a.sessionsPlanned || undefined,
        participantsExpectedF: a.participantsExpectedF || undefined,
        participantsExpectedM: a.participantsExpectedM || undefined,
        progress: typeof a.progress === 'number' ? a.progress : undefined,
        category: a.category || a.type || undefined,
        reviewStatus: mapReviewStatus(a.reviewStatus) || undefined,
        submittedBy: a.submittedBy || undefined,
        submittedAt: a.submittedAt ? new Date(a.submittedAt) : undefined,
        reviewedBy: a.reviewedBy || undefined,
        reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : undefined,
        reviewNotes: a.reviewNotes || undefined,
        issues: a.issues || undefined,
      },
    });
  }

  // Milestones
  for (const m of db.projectMilestones as any[]) {
    await prisma.milestone.upsert({
      where: { id: m.id },
      update: {
        projectId: m.projectId,
        activityId: m.activityId || undefined,
        label: m.label,
        targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
        status: mapMilestoneStatus(m.status),
        progress: typeof m.progress === 'number' ? m.progress : 0,
        plannedBudget: m.plannedBudget || undefined,
        type: m.type || undefined,
      },
      create: {
        id: m.id,
        projectId: m.projectId,
        activityId: m.activityId || undefined,
        label: m.label,
        targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
        status: mapMilestoneStatus(m.status),
        progress: typeof m.progress === 'number' ? m.progress : 0,
        plannedBudget: m.plannedBudget || undefined,
        type: m.type || undefined,
      },
    });
  }

  // Expenses
  for (const e of db.projectExpenses as any[]) {
    const id: string = e.id;
    await prisma.expense.upsert({
      where: { id },
      update: {
        projectId: e.projectId,
        activityId: e.activityId,
        milestoneId: e.milestoneId || undefined,
        category: mapExpenseCategory(e.category),
        date: new Date(e.date),
        description: e.description,
        payee: e.payee,
        method: mapPaymentMethod(e.method),
        currency: e.currency,
        amount: e.amount,
        fx: typeof e.fx === 'number' ? e.fx : undefined,
        status: mapReviewStatus(e.status) || 'DRAFT',
        attachment: e.attachment || undefined,
      },
      create: {
        id,
        projectId: e.projectId,
        activityId: e.activityId,
        milestoneId: e.milestoneId || undefined,
        category: mapExpenseCategory(e.category),
        date: new Date(e.date),
        description: e.description,
        payee: e.payee,
        method: mapPaymentMethod(e.method),
        currency: e.currency,
        amount: e.amount,
        fx: typeof e.fx === 'number' ? e.fx : undefined,
        status: mapReviewStatus(e.status) || 'DRAFT',
        attachment: e.attachment || undefined,
      },
    });
  }

  // Reports
  for (const r of db.projectReports as any[]) {
    await prisma.report.upsert({
      where: { id: r.id },
      update: {
        projectId: r.projectId,
        type: mapReportType(r.type),
        period: r.period || undefined,
        milestoneId: r.milestoneId || undefined,
        activityId: r.activityId || undefined,
        author: r.author,
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : undefined,
        status: mapReviewStatus(r.status) || 'DRAFT',
        file: r.file || undefined,
      },
      create: {
        id: r.id,
        projectId: r.projectId,
        type: mapReportType(r.type),
        period: r.period || undefined,
        milestoneId: r.milestoneId || undefined,
        activityId: r.activityId || undefined,
        author: r.author,
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : undefined,
        status: mapReviewStatus(r.status) || 'DRAFT',
        file: r.file || undefined,
      },
    });
  }

  // Beneficiaries
  for (const b of db.beneficiaries as any[]) {
    await prisma.beneficiary.upsert({
      where: { id: b.id },
      update: {
        projectId: b.projectId,
        date: new Date(b.date),
        type: mapBeneficiaryType(b.type),
        females: b.females,
        males: b.males,
        notes: b.notes || undefined,
        file: b.file || undefined,
      },
      create: {
        id: b.id,
        projectId: b.projectId,
        date: new Date(b.date),
        type: mapBeneficiaryType(b.type),
        females: b.females,
        males: b.males,
        notes: b.notes || undefined,
        file: b.file || undefined,
      },
    });
  }

  console.log('Mock data migrated successfully.');
}

main().then(()=> prisma.$disconnect()).catch(async (e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
