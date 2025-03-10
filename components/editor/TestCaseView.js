import styles from '../../styles/TestCase.module.css';

export default function TestCaseView({ testCase, result, index }) {
  const getStatusClass = () => {
    if (!result) return styles.pending;
    return result.actualOutput?.trim() === result.expectedOutput?.trim() 
      ? styles.passed 
      : styles.failed;
  };

  return (
    <div className={`${styles.testCase} ${getStatusClass()}`}>
      <div className={styles.testCaseHeader}>
        <span>Case {index + 1}</span>
        {result && (
          <span className={`${styles.testStatus} ${getStatusClass()}`}>
            {result.actualOutput?.trim() === result.expectedOutput?.trim() 
              ? '✓' : '✗'}
          </span>
        )}
      </div>
      <div className={styles.testDetails}>
        <div className={styles.testIO}>
          <div className={styles.testSection}>
            <div className={styles.testLabel}>Input:</div>
            <pre>{testCase.input}</pre>
          </div>
          <div className={styles.testSection}>
            <div className={styles.testLabel}>Expected:</div>
            <pre>{testCase.output}</pre>
          </div>
          {result && (
            <>
              <div className={styles.testSection}>
                <div className={styles.testLabel}>Output:</div>
                <pre>{result.actualOutput}</pre>
              </div>
              <div className={styles.testStats}>
                <span>Time: {result.time}s</span>
                <span>Memory: {result.memory}KB</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
