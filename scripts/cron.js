import cron from 'node-cron';
import { updateDailyProblems } from './updateDailyProblems.js';

// Run at midnight IST (18:30 UTC previous day)
cron.schedule('30 18 * * *', async () => {
  console.log('Running daily problem update...');
  await updateDailyProblems();
  console.log('Daily problem update complete');
});
