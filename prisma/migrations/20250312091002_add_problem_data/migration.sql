/*
  Warnings:

  - You are about to drop the column `handle` on the `DailyProblem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rating,date]` on the table `DailyProblem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `problemData` to the `DailyProblem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyProblem_handle_date_key";

-- AlterTable
ALTER TABLE "DailyProblem" DROP COLUMN "handle",
ADD COLUMN     "problemData" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DailyProblem_rating_date_key" ON "DailyProblem"("rating", "date");
