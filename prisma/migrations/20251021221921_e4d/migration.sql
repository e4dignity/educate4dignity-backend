-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'DONOR', 'SUPPLIER', 'DISTRIBUTOR', 'TRAINER', 'TEAM');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('BLANK', 'DISTRIBUTION', 'TRAINING', 'R_AND_D', 'PROCUREMENT', 'HYBRID');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('PRODUCTION', 'DISTRIBUTION', 'TRAINING', 'ADMIN', 'PROCUREMENT', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('MONTHLY', 'MILESTONE', 'FINAL');

-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('DISTRIBUTION', 'TRAINING');

-- CreateEnum
CREATE TYPE "LogisticsStatus" AS ENUM ('PREP', 'PICKUP', 'IN_TRANSIT', 'CUSTOMS', 'DELAYED', 'DELIVERED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFASecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleName" "RoleName" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleName")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL,
    "organisation" TEXT NOT NULL,
    "orgType" TEXT,
    "location" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "collected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "manager" TEXT,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "operators" TEXT[],
    "primaryOperator" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignee" TEXT,
    "assigneeType" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'TODO',
    "priority" TEXT,
    "due" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "plannedBudget" DOUBLE PRECISION,
    "allocated" DOUBLE PRECISION,
    "kpiTargetValue" DOUBLE PRECISION,
    "kpiUnit" TEXT,
    "sessionsPlanned" INTEGER,
    "participantsExpectedF" INTEGER,
    "participantsExpectedM" INTEGER,
    "progress" INTEGER,
    "category" TEXT,
    "attachments" JSONB,
    "reviewStatus" "ReviewStatus",
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "issues" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "activityId" TEXT,
    "label" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "plannedBudget" DOUBLE PRECISION,
    "type" TEXT,
    "owner" TEXT,
    "location" TEXT,
    "targetKits" INTEGER,
    "targetSchools" INTEGER,
    "sessionsPlanned" INTEGER,
    "participantsExpectedF" INTEGER,
    "participantsExpectedM" INTEGER,
    "itemsScope" TEXT,
    "poRef" TEXT,
    "prototypeVersion" TEXT,
    "hypothesis" TEXT,
    "dependsOnId" TEXT,
    "risk" TEXT,
    "externalRef" TEXT,
    "description" TEXT,
    "logisticsStatus" "LogisticsStatus",
    "origin" TEXT,
    "destination" TEXT,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "eta" TIMESTAMP(3),
    "shippedOn" TIMESTAMP(3),
    "deliveredOn" TIMESTAMP(3),
    "qtyPlanned" INTEGER,
    "qtyShipped" INTEGER,
    "qtyReceived" INTEGER,
    "unit" TEXT,
    "damagesNotes" TEXT,
    "actualSpentUSD" DOUBLE PRECISION,
    "notes" TEXT,
    "attachments" JSONB,
    "completedOn" TIMESTAMP(3),
    "issues" TEXT,
    "nextSteps" TEXT,
    "outputs" INTEGER,
    "outputsUnit" TEXT,
    "reviewStatus" "ReviewStatus",
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "payee" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fx" DOUBLE PRECISION,
    "status" "ReviewStatus" NOT NULL,
    "attachment" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "period" TEXT,
    "milestoneId" TEXT,
    "activityId" TEXT,
    "author" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL,
    "file" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "BeneficiaryType" NOT NULL,
    "females" INTEGER NOT NULL,
    "males" INTEGER NOT NULL,
    "notes" TEXT,
    "file" TEXT,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'impact',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "readMinutes" INTEGER NOT NULL DEFAULT 5,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'published',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElearnModule" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElearnModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElearnLesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "moduleId" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "durationMinutes" INTEGER NOT NULL DEFAULT 8,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverImageUrl" TEXT,
    "quickTip" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ElearnLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ElearnModule_slug_key" ON "ElearnModule"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ElearnLesson_slug_key" ON "ElearnLesson"("slug");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElearnLesson" ADD CONSTRAINT "ElearnLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ElearnModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
