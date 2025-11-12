-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "authorAvatarUrl" TEXT,
ADD COLUMN     "authorBio" TEXT,
ADD COLUMN     "authorRole" TEXT,
ADD COLUMN     "calloutTransparency" TEXT,
ADD COLUMN     "contentMarkdown" TEXT,
ADD COLUMN     "coverConsentVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;
