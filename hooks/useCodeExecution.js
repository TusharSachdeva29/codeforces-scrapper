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
        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = await getSubmissionResult(token);
        } while (result.status.id <= 2);

        newResults.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.stdout,
          status: result.status,
          time: result.time,
          memory: result.memory
        });
      }
      
      setResults(newResults);
      return newResults;
    } finally {
      setIsRunning(false);
    }
  };

  return { results, setResults, isRunning, executeCode };
}
