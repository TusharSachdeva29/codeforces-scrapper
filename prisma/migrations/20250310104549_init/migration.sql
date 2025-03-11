-- CreateTable
CREATE TABLE "Problem" (
    "id" SERIAL NOT NULL,
    "contestId" INTEGER NOT NULL,
    "problemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER,
    "tags" TEXT[],
    "cached" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyProblem" (
    "id" SERIAL NOT NULL,
    "handle" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "problemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "DailyProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyProblem_handle_date_key" ON "DailyProblem"("handle", "date");
