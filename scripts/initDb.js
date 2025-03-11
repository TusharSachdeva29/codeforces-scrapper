import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';  // Add this import

const prisma = new PrismaClient();

async function cacheProblem(problem) {
  try {
    return await prisma.problem.upsert({
      where: {
        id: problem.id || 0
      },
      update: {
        cached: new Date()
      },
      create: {
        contestId: problem.contestId,
        problemId: problem.index,
        name: problem.name,
        rating: problem.rating || null,
        tags: problem.tags || []
      }
    });
  } catch (error) {
    console.error('Error caching problem:', error);
    return null;
  }
}

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    const response = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log(`Found ${data.result.problems.length} problems`);
      
      const batchSize = 50;
      for (let i = 0; i < data.result.problems.length; i += batchSize) {
        const batch = data.result.problems.slice(i, i + batchSize);
        await Promise.all(batch.map(problem => cacheProblem(problem)));
        console.log(`Processed ${i + batch.length} problems`);
      }
      
      console.log('Database initialization complete!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();
