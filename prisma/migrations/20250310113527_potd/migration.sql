-- CreateTable
CREATE TABLE "RatingProblem" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "problemData" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contestId" INTEGER NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "RatingProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RatingProblem_rating_date_key" ON "RatingProblem"("rating", "date");
