/*
  Warnings:

  - The values [SUPPLIER,DISTRIBUTOR,TRAINER,TEAM] on the enum `RoleName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Beneficiary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ElearnLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ElearnModule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleName_new" AS ENUM ('ADMIN', 'DONOR');
ALTER TABLE "UserRole" ALTER COLUMN "roleName" TYPE "RoleName_new" USING ("roleName"::text::"RoleName_new");
ALTER TYPE "RoleName" RENAME TO "RoleName_old";
ALTER TYPE "RoleName_new" RENAME TO "RoleName";
DROP TYPE "RoleName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Beneficiary" DROP CONSTRAINT "Beneficiary_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ElearnLesson" DROP CONSTRAINT "ElearnLesson_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_activityId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_activityId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_activityId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_projectId_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Beneficiary";

-- DropTable
DROP TABLE "ElearnLesson";

-- DropTable
DROP TABLE "ElearnModule";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "Milestone";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Report";

-- DropEnum
DROP TYPE "ActivityStatus";

-- DropEnum
DROP TYPE "BeneficiaryType";

-- DropEnum
DROP TYPE "ExpenseCategory";

-- DropEnum
DROP TYPE "LogisticsStatus";

-- DropEnum
DROP TYPE "MilestoneStatus";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "ProjectType";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "ReviewStatus";

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "donorId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "purpose" TEXT,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "donationType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'journey',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_sessionId_key" ON "Donation"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
