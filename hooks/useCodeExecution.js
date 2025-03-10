import { useState } from 'react';
import { submitCode, getSubmissionResult } from '../utils/judge0';

export function useCodeExecution() {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeCode = async (code, testCases, languageId) => {
    setIsRunning(true);
    try {
      const newResults = [];
      
      for (const testCase of testCases) {
        const token = await submitCode(code, testCase.input, languageId);
        let result;
        let attempts = 0;
        const maxAttempts = 10;

        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = await getSubmissionResult(token);
          attempts++;

          // Break if we've waited too long or if there's an error
          if (attempts >= maxAttempts || result.status?.description === 'Internal Error') {
            throw new Error('Execution timeout or error');
          }
        } while (
          result?.status?.id === 1 || // In Queue
          result?.status?.id === 2    // Processing
        );

        newResults.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.stdout || result.stderr || 'No output',
          status: result.status || { description: 'Unknown Status' },
          time: result.time || 0,
          memory: result.memory || 0,
          error: result.stderr || null
        });
      }
      
      setResults(newResults);
      return newResults;
    } catch (error) {
      console.error('Code execution error:', error);
      setResults([]);
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  return { results, setResults, isRunning, executeCode };
}
