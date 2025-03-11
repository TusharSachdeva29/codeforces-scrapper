import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProblemForRating(rating, handle) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user already has a problem for today
  const existingProblem = await prisma.dailyProblem.findFirst({
    where: {
      handle,
      date: {
        gte: today
      }
    }
  });

  if (existingProblem) {
    return prisma.problem.findFirst({
      where: {
        contestId: existingProblem.contestId,
        problemId: existingProblem.problemId
      }
    });
  }

  // Get a new problem within rating range (±100)
  const problem = await prisma.problem.findFirst({
    where: {
      rating: {
        gte: rating - 100,
        lte: rating + 100
      }
    },
    orderBy: {
      cached: 'desc'
    }
  });

  if (problem) {
    // Save this problem as today's problem for the user
    await prisma.dailyProblem.create({
      data: {
        handle,
        rating,
        problemId: problem.problemId,
        contestId: problem.contestId
      }
    });
  }

  return problem;
}

export async function cacheProblem(problem) {
  return prisma.problem.upsert({
    where: {
      id: problem.id
    },
    update: {
      cached: new Date()
    },
    create: {
      contestId: problem.contestId,
      problemId: problem.index,
      name: problem.name,
      rating: problem.rating || null,
      tags: problem.tags
    }
  });
}
