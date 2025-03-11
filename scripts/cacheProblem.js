import { cacheProblem } from '../lib/db';

async function cacheProblems() {
  try {
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await response.json();
    
    if (data.status === 'OK') {
      for (const problem of data.result.problems) {
        await cacheProblem(problem);
      }
    }
  } catch (error) {
    console.error('Error caching problems:', error);
  }
}

// Run this script periodically to update cache
cacheProblems();
