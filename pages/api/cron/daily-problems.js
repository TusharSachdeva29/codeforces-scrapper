import { PrismaClient } from '@prisma/client';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const RATINGS = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];

async function scrapeAndFormat(url) {
  return new Promise((resolve, reject) => {
    execFile('node', ['test.js', url], async (error) => {
      if (error) reject(error);
      const scrapedData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'scraping1.json'), 'utf8')
      );
      resolve(scrapedData);
    });
  });
}

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized access
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Clear old daily problems
    await prisma.dailyProblem.deleteMany({});

    for (const rating of RATINGS) {
      const problem = await prisma.problem.findFirst({
        where: { rating },
        orderBy: { cached: 'desc' }
      });

      if (problem) {
        const url = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemId}`;
        const scrapedData = await scrapeAndFormat(url);

        await prisma.dailyProblem.create({
          data: {
            rating,
            problemId: problem.problemId,
            contestId: problem.contestId,
            problemData: scrapedData,
            date: new Date()
          }
        });
      }
    }

    res.status(200).json({ message: 'Daily problems updated successfully' });
  } catch (error) {
    console.error('Error updating daily problems:', error);
    res.status(500).json({ error: 'Failed to update daily problems' });
  }
}
