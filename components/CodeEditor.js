import dynamic from 'next/dynamic';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import { useState, useEffect } from 'react';
import { submitCode, getSubmissionResult, Languages } from '../utils/judge0';
import { saveToStorage, getFromStorage, storageKeys } from '../utils/storage';

const AceEditor = dynamic(() => import('react-ace'), { ssr: false });

export default function CodeEditor({ testCases }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = getFromStorage(storageKeys.LANGUAGE);
      if (savedLanguage && Languages[savedLanguage]) {
        return Languages[savedLanguage];
      }
    }
    return Languages.CPP; // Default fallback
  });

  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCode = getFromStorage(storageKeys.CODE);
      if (savedCode) return savedCode;
    }
    return Languages.CPP.template;
  });

  const [activeTab, setActiveTab] = useState('code'); // code, testcases, custom, submissions
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');

  useEffect(() => {
    // Load saved code and language on mount
    if (typeof window !== 'undefined') {
      const savedLanguage = getFromStorage(storageKeys.LANGUAGE);
      const savedCode = getFromStorage(storageKeys.CODE);
      
      if (savedLanguage && Languages[savedLanguage]) {
        setLanguage(Languages[savedLanguage]);
      }
      
      if (savedCode) {
        setCode(savedCode);
      }
    }
  }, []);

  useEffect(() => {
    // Update code template when language changes
    setCode(language.template);
  }, [language]);

  // Add effect to reset results when test cases change
  useEffect(() => {
    setResults([]);
    setActiveTab('code');
  }, [testCases]);

  // Save code when it changes
  useEffect(() => {
    saveToStorage(storageKeys.CODE, code);
  }, [code]);

  // Save language when it changes
  useEffect(() => {
    saveToStorage(storageKeys.LANGUAGE, language.name);
  }, [language]);

  const handleLanguageChange = (e) => {
    const newLanguage = Object.values(Languages).find(
      lang => lang.id === parseInt(e.target.value)
    ) || Languages.CPP; // Fallback to CPP if not found
    setLanguage(newLanguage);
    
    // Only update code template if there's no existing code
    const savedCode = getFromStorage(storageKeys.CODE);
    if (!savedCode) {
      setCode(newLanguage.template);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const newResults = [];
      
      for (const testCase of testCases) {
        const token = await submitCode(code, testCase.input, language.id);
        
        // Poll for results
        let result;
        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = await getSubmissionResult(token);
        } while (result.status.id <= 2); // While in queue or processing

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
      setActiveTab('testcases');
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCustomTestCase = async () => {
    setIsRunning(true);
    try {
      const token = await submitCode(code, customInput, language.id);
      
      let result;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await getSubmissionResult(token);
      } while (result.status.id <= 2);

      setResults([{
        input: customInput,
        expectedOutput: customOutput,
        actualOutput: result.stdout,
        status: result.status,
        time: result.time,
        memory: result.memory
      }]);
      
      setActiveTab('testcases');
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const allTestsPassed = results.length > 0 && results.every(result => 
    result.actualOutput?.trim() === result.expectedOutput?.trim()
  );

  // Add safety check for language rendering
  if (!language) return null;

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="language-selector">
          <select 
            value={language.id}
            onChange={handleLanguageChange}
          >
            {Object.values(Languages).map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="editor-tabs">
          <button 
            className={`tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
          <button 
            className={`tab ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            Sample Cases ({testCases.length})
          </button>
          <button 
            className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Input
          </button>
        </div>
      </div>

      <div className="editor-content">
        {activeTab === 'code' ? (
          <>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your C++ code here..."
            />
            <div className="editor-actions">
              <button 
                onClick={runCode} 
                disabled={isRunning}
                className="run-button"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </>
        ) : activeTab === 'testcases' ? (
          <div className="test-cases">
            {results.length > 0 && (
              <div className={`submission-status ${allTestsPassed ? 'accepted' : 'rejected'}`}>
                {allTestsPassed ? 'Accepted' : 'Wrong Answer'}
              </div>
            )}
            <div className="test-cases-header">
              <h4>Test Cases</h4>
              <button onClick={runCode} disabled={isRunning} className="run-button">
                {isRunning ? 'Running...' : 'Run All Cases'}
              </button>
            </div>
            <div className="test-cases-grid">
              {testCases.map((testCase, index) => (
                <div key={index} 
                  className={`test-case ${
                    !results[index] ? 'pending' :
                    results[index].actualOutput?.trim() === results[index].expectedOutput?.trim() 
                      ? 'passed' : 'failed'
                  }`}
                >
                  <div className="test-case-header">
                    <span>Case {index + 1}</span>
                    {results[index] && (
                      <span className="test-status">
                        {results[index].actualOutput?.trim() === results[index].expectedOutput?.trim() 
                          ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                  <div className="test-details">
                    <div className="test-io">
                      <div className="test-section">
                        <div className="test-label">Input:</div>
                        <pre>{testCase.input}</pre>
                      </div>
                      <div className="test-section">
                        <div className="test-label">Expected:</div>
                        <pre>{testCase.output}</pre>
                      </div>
                      {results[index] && (
                        <div className="test-section">
                          <div className="test-label">Output:</div>
                          <pre>{results[index].actualOutput}</pre>
                        </div>
                      )}
                    </div>
                    {results[index] && (
                      <div className="test-stats">
                        <span>Time: {results[index].time}s</span>
                        <span>Memory: {results[index].memory}KB</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="custom-testcase">
            <div className="input-section">
              <h4>Input:</h4>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your test input here..."
              />
            </div>
            <div className="input-section">
              <h4>Expected Output:</h4>
              <textarea
                value={customOutput}
                onChange={(e) => setCustomOutput(e.target.value)}
                placeholder="Enter expected output (optional)..."
              />
            </div>
            <button 
              onClick={runCustomTestCase}
              disabled={isRunning}
              className="run-button"
            >
              {isRunning ? 'Running...' : 'Run Custom Test'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .editor-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
          color: #fff;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #2d2d2d;
          padding: 0.5rem;
        }

        .language-selector select {
          background: #1e1e1e;
          color: #fff;
          border: 1px solid #444;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .language-selector select:focus {
          outline: none;
          border-color: #007acc;
        }

        .editor-tabs {
          display: flex;
          background: #2d2d2d;
        }

        .tab {
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          color: #fff;
          cursor: pointer;
        }

        .tab.active {
          background: #1e1e1e;
          border-bottom: 2px solid #007acc;
        }

        .editor-content {
          flex: 1;
          overflow: auto;
        }

        textarea {
          width: 100%;
          height: 100%;
          background: #1e1e1e;
          color: #d4d4d4;
          border: none;
          padding: 1rem;
          font-family: monospace;
          resize: none;
        }

        .editor-actions {
          padding: 1rem;
          border-top: 1px solid #333;
        }

        .run-button {
          background: #0078d4;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }

        .run-button:disabled {
          background: #004c87;
        }

        .test-cases {
          padding: 1rem;
        }

        .test-case {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 4px;
          background: #2d2d2d;
        }

        .test-case.passed {
          border-left: 4px solid #4caf50;
        }

        .test-case.failed {
          border-left: 4px solid #f44336;
        }

        .test-details {
          margin-top: 0.5rem;
        }

        pre {
          background: #1e1e1e;
          padding: 0.5rem;
          border-radius: 4px;
          overflow-x: auto;
        }

        .custom-testcase {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-section textarea {
          height: 150px;
          background: #2d2d2d;
          color: #d4d4d4;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 0.5rem;
          font-family: monospace;
        }

        .input-section h4 {
          color: #d4d4d4;
          margin: 0;
        }

        .test-cases-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .no-test-cases {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .submission-status {
          padding: 1rem;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: bold;
          font-size: 1.2em;
        }

        .submission-status.accepted {
          background: #28a745;
          color: white;
        }

        .submission-status.rejected {
          background: #dc3545;
          color: white;
        }

        .test-cases-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .test-case {
          border: 1px solid #444;
          border-radius: 8px;
          overflow: hidden;
        }

        .test-case-header {
          padding: 0.5rem 1rem;
          background: #2d2d2d;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #444;
        }

        .test-status {
          font-weight: bold;
        }

        .passed .test-status {
          color: #28a745;
        }

        .failed .test-status {
          color: #dc3545;
        }

        .test-io {
          padding: 1rem;
        }

        .test-section {
          margin-bottom: 0.8rem;
        }

        .test-label {
          color: #888;
          margin-bottom: 0.3rem;
          font-size: 0.9em;
        }

        .test-stats {
          padding: 0.5rem 1rem;
          background: #2d2d2d;
          border-top: 1px solid #444;
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
          color: #888;
        }
      `}</style>
    </div>
  );
}
