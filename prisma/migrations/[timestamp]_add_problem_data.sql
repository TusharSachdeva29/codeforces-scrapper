-- First copy existing daily problems to temp table
CREATE TABLE "DailyProblem_temp" AS
SELECT * FROM "DailyProblem";

-- Drop original table
DROP TABLE "DailyProblem";

-- Recreate table with new schema
CREATE TABLE "DailyProblem" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "problemId" TEXT NOT NULL,
    "contestId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "problemData" JSONB NOT NULL,

    CONSTRAINT "DailyProblem_pkey" PRIMARY KEY ("id")
);

-- Copy data back with empty JSON object as default problemData
INSERT INTO "DailyProblem" ("id", "rating", "problemId", "contestId", "date", "problemData")
SELECT 
    "id", 
    "rating", 
    "problemId", 
    "contestId", 
    "date",
    '{}' AS "problemData"
FROM "DailyProblem_temp";

-- Drop temp table
DROP TABLE "DailyProblem_temp";

-- Create the unique constraint
CREATE UNIQUE INDEX "DailyProblem_rating_date_key" ON "DailyProblem"("rating", "date");
