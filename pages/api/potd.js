import { PrismaClient } from '@prisma/client';
import { formatMathWithGemini } from '../../utils/gemini';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { rating } = req.body;
    console.log('Received request:', { rating });
    
    const normalizedRating = Math.min(1600, Math.max(800, Math.round(rating/100) * 100));
    console.log('Normalized rating:', normalizedRating);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's problem for this rating
    const problem = await prisma.ratingProblem.findFirst({
      where: {
        rating: normalizedRating,
        date: {
          gte: today
        }
      }
    });
    
    console.log('Found problem:', problem);

    if (!problem) {
      return res.status(404).json({ message: 'No problem found for today' });
    }

    // Generate Codeforces URL
    const url = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemId}`;
    console.log('Problem URL:', url);

    // Run scraper script
    await new Promise((resolve, reject) => {
      execFile('node', ['test.js', url], async (error) => {
        if (error) reject(error);
        resolve();
      });
    });

    // Read scraped data
    const scrapedData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'scraping1.json'), 'utf8')
    );

    // Store this as user's problem for today
    await prisma.dailyProblem.create({
      data: {
        rating: normalizedRating,
        problemId: problem.problemId,
        contestId: problem.contestId,
        date: today
      }
    });

    // Format the response with required fields
    const formattedData = {
      ...scrapedData,
      contestId: problem.contestId,
      problemId: problem.problemId,
      rating: problem.rating
    };

    res.status(200).json({ problem: formattedData });
  } catch (error) {
    console.error('Error in POTD API:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
