/*
  Warnings:

  - Added the required column `fileName` to the `ProjectDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `ProjectDocument` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `documentType` on the `ProjectDocument` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('VERTRAG', 'ANGEBOT', 'RECHNUNG', 'PLAN', 'GUTACHTEN', 'PROTOKOLL', 'KORRESPONDENZ', 'SONSTIGES');

-- DropForeignKey
ALTER TABLE "ProjectDocument" DROP CONSTRAINT "ProjectDocument_projectId_fkey";

-- AlterTable
ALTER TABLE "ProjectDocument" ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
DROP COLUMN "documentType",
ADD COLUMN     "documentType" "DocumentType" NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
