import styles from '../../styles/TestCase.module.css';

export default function TestCaseView({ testCases, results, isRunning, onRunCode }) {
  const allTestsPassed = results.length > 0 && 
    results.every(result => result.actualOutput?.trim() === result.expectedOutput?.trim());

  return (
    <div className={styles.testCasesContainer}>
      {results.length > 0 && (
        <div className={`${styles.submissionStatus} ${allTestsPassed ? styles.accepted : styles.rejected}`}>
          {allTestsPassed ? 'Accepted' : 'Wrong Answer'}
        </div>
      )}
      
      <div className={styles.testCasesHeader}>
        <h4>Test Cases</h4>
        <button 
          onClick={onRunCode} 
          disabled={isRunning}
          className={styles.runButton}
        >
          {isRunning ? 'Running...' : 'Run All Cases'}
        </button>
      </div>

      <div className={styles.testCasesVertical}>
        {testCases.map((testCase, index) => (
          <div 
            key={index}
            className={`${styles.testCase} ${
              !results[index] ? styles.pending :
              results[index].actualOutput?.trim() === results[index].expectedOutput?.trim() 
                ? styles.passed : styles.failed
            }`}
          >
            <div className={styles.testCaseHeader}>
              <span>Test Case {index + 1}</span>
              {results[index] && (
                <span className={styles.testStatus}>
                  {results[index].actualOutput?.trim() === results[index].expectedOutput?.trim() 
                    ? '✓' : '✗'}
                </span>
              )}
            </div>

            <div className={styles.testDetails}>
              <div className={styles.ioSection}>
                <div className={styles.inputArea}>
                  <div className={styles.testLabel}>Input:</div>
                  <pre className={styles.preformatted}>{testCase.input}</pre>
                </div>

                <div className={styles.outputArea}>
                  <div className={styles.testLabel}>Expected Output:</div>
                  <pre className={styles.preformatted}>{testCase.output}</pre>
                  
                  {results[index] && (
                    <>
                      <div className={styles.testLabel}>Your Output:</div>
                      <pre className={styles.preformatted}>{results[index].actualOutput}</pre>
                    </>
                  )}
                </div>
              </div>

              {results[index] && (
                <div className={styles.testStats}>
                  <span>Time: {results[index].time}s</span>
                  <span>Memory: {results[index].memory}KB</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
