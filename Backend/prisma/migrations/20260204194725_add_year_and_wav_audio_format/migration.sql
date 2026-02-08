/*
  Warnings:

  - You are about to drop the column `audio_codec` on the `student_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_submissions" DROP COLUMN "audio_codec";

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "year" INTEGER NOT NULL DEFAULT 1;
