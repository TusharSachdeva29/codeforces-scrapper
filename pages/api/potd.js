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

    // Run scraper script with improved error handling
    try {
      await new Promise((resolve, reject) => {
        execFile('node', ['test.js', url], {timeout: 60000}, (error, stdout, stderr) => {
          if (error) {
            console.error('Scraper script error:', error);
            console.error('Stderr:', stderr);
            if (error.message.includes('Cannot find module')) {
              reject(new Error('Missing dependencies. Please run: npm install puppeteer axios'));
            } else {
              reject(error);
            }
          } else {
            resolve(stdout);
          }
        });
      });
    } catch (scriptError) {
      console.error('Failed to run scraper:', scriptError);
      return res.status(500).json({ 
        message: scriptError.message || 'Failed to run scraper script',
        error: 'SCRAPER_ERROR' 
      });
    }

    // Check if scraping result file exists
    const scrapingFilePath = path.join(process.cwd(), 'scraping1.json');
    if (!fs.existsSync(scrapingFilePath)) {
      return res.status(500).json({ 
        message: 'Scraping failed to produce output file',
        error: 'NO_OUTPUT_FILE'
      });
    }

    // Read scraped data
    const scrapedData = JSON.parse(
      fs.readFileSync(scrapingFilePath, 'utf8')
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
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      errorType: error.name || 'UnknownError'
    });
  }
}
