import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { formatMathWithGemini } from '../utils/gemini';

const prisma = new PrismaClient();
const RATINGS = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];

async function fetchAndParseProblem(contestId, problemId) {
  const url = `https://codeforces.com/problemset/problem/${contestId}/${problemId}`;
  // Your existing scraping logic here
  // After scraping, parse with Gemini
  const parsedData = await formatMathWithGemini(scrapedData);
  return parsedData;
}

async function updateDailyProblems() {
  try {
    // Clear old problems
    await prisma.ratingProblem.deleteMany({
      where: {
        date: {
          lt: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Fetch all problems from CF API
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await response.json();
    
    if (data.status === 'OK') {
      for (const rating of RATINGS) {
        // Filter problems by rating
        const ratingProblems = data.result.problems.filter(p => p.rating === rating);
        
        // Randomly select one problem
        const randomProblem = ratingProblems[Math.floor(Math.random() * ratingProblems.length)];
        
        // Parse and store problem
        const parsedProblem = await fetchAndParseProblem(
          randomProblem.contestId,
          randomProblem.index
        );

        await prisma.ratingProblem.create({
          data: {
            rating,
            problemData: parsedProblem,
            contestId: randomProblem.contestId,
            problemId: randomProblem.index
          }
        });
      }
    }
  } catch (error) {
    console.error('Error updating daily problems:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  updateDailyProblems();
}

export { updateDailyProblems };
