import { useState, useEffect } from 'react';
import { saveToStorage, getFromStorage, storageKeys } from '../../utils/storage';
import styles from '../../styles/CustomTestCase.module.css';

export default function CustomTestCase({ onRunTest }) {
  const [testCases, setTestCases] = useState(() => {
    if (typeof window !== 'undefined') {
      return getFromStorage(storageKeys.CUSTOM_TEST_CASES) || [{ input: '', expectedOutput: '' }];
    }
    return [{ input: '', expectedOutput: '' }];
  });
  const [results, setResults] = useState([]);

  // Save test cases whenever they change
  useEffect(() => {
    saveToStorage(storageKeys.CUSTOM_TEST_CASES, testCases);
  }, [testCases]);

  const addNewTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '' }]);
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
    setResults(results.filter((_, i) => i !== index));
  };

  const runTestCase = async (index) => {
    const result = await onRunTest(testCases[index].input, testCases[index].expectedOutput);
    const newResults = [...results];
    newResults[index] = result;
    setResults(newResults);
  };

  return (
    <div className={styles.customTestContainer}>
      {testCases.map((testCase, index) => (
        <div key={index} className={styles.testCaseBox}>
          <div className={styles.testCaseHeader}>
            <h4>Custom Test Case #{index + 1}</h4>
            <div className={styles.testCaseActions}>
              <button 
                onClick={() => runTestCase(index)}
                className={styles.runButton}
              >
                Run
              </button>
              <button 
                onClick={() => removeTestCase(index)}
                className={styles.removeButton}
              >
                ✕
              </button>
            </div>
          </div>
          
          {results[index] && (
            <div className={`${styles.result} ${
              results[index].actualOutput?.trim() === results[index].expectedOutput?.trim() 
                ? styles.accepted 
                : styles.rejected
            }`}>
              {results[index].actualOutput?.trim() === results[index].expectedOutput?.trim() 
                ? 'Accepted' 
                : 'Wrong Answer'}
            </div>
          )}

          <div className={styles.inputSection}>
            <textarea
              value={testCase.input}
              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
              placeholder="Enter input..."
            />
          </div>
          <div className={styles.inputSection}>
            <textarea
              value={testCase.expectedOutput}
              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
              placeholder="Enter expected output..."
            />
          </div>
          
          {results[index] && (
            <div className={styles.outputSection}>
              <h5>Output:</h5>
              <pre>{results[index].actualOutput}</pre>
              <div className={styles.stats}>
                <span>Time: {results[index].time}s</span>
                <span>Memory: {results[index].memory}KB</span>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <button 
        onClick={addNewTestCase}
        className={styles.addButton}
      >
        + Add Test Case
      </button>
    </div>
  );
}
