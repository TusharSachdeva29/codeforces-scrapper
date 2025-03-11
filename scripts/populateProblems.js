const { PrismaClient } = require('@prisma/client');
const { scrapeProblemData } = require('../test');

const prisma = new PrismaClient();
const RATINGS = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];

async function populateProblems() {
  try {
    // Clear old rating problems
    await prisma.ratingProblem.deleteMany({});

    for (const rating of RATINGS) {
      const problem = await prisma.problem.findFirst({
        where: { rating },
        orderBy: { cached: 'desc' }
      });

      if (problem) {
        // Get full problem data using existing scraper
        const url = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemId}`;
        const scrapedData = await scrapeProblemData(url);

        // Create rating problem entry with full content
        await prisma.ratingProblem.create({
          data: {
            rating,
            problemData: {
              ...scrapedData,
              contestId: problem.contestId,
              index: problem.problemId,
              rating: problem.rating,
              tags: problem.tags
            },
            contestId: problem.contestId,
            problemId: problem.problemId,
            date: new Date()
          }
        });
        
        console.log(`Added problem for rating ${rating}: ${problem.name}`);
      } else {
        console.log(`No problem found for rating ${rating}`);
      }
    }

    console.log('Finished populating rating problems');
  } catch (error) {
    console.error('Error populating problems:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateProblems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
