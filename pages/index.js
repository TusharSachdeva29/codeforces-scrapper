import { useState, useEffect } from 'react';
import ProblemDetails from '../components/ProblemDetails';
import CodeEditor from '../components/CodeEditor';
import SlidingPanels from '../components/SlidingPanels';
import { saveToStorage, getFromStorage, storageKeys, clearStorageExcept } from '../utils/storage';

export default function Home() {
  const [problemData, setProblemData] = useState(null);
  const [url, setUrl] = useState('');

  // Load saved problem data on initial render
  useEffect(() => {
    const savedProblem = getFromStorage(storageKeys.PROBLEM_DATA);
    if (savedProblem) {
      setProblemData(savedProblem);
    }
  }, []);

  const fetchProblemData = async () => {
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setProblemData(data);
      saveToStorage(storageKeys.PROBLEM_DATA, data);
      
      // Clear code storage when loading a new problem
      clearStorageExcept([storageKeys.PROBLEM_DATA]);
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  return (
    <div className="main-container">
      <div className="url-input">
        <input
          type="text"
          placeholder="Enter Codeforces problem URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={fetchProblemData}>Submit</button>
      </div>

      <SlidingPanels
        leftPanel={problemData && <ProblemDetails data={problemData} />}
        rightPanel={
          <CodeEditor 
            testCases={
              problemData ? 
                problemData.sampleInputs.map((input, index) => ({
                  input,
                  output: problemData.sampleOutputs[index]
                })) 
                : []
            } 
          />
        }
      />

      <style jsx>{`
        .main-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .url-input {
          padding: 1rem;
          display: flex;
          gap: 1rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        button {
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
