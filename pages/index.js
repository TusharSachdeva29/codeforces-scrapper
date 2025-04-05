import { useState, useEffect } from 'react';
import ProblemDetails from '../components/ProblemDetails';
import CodeEditor from '../components/CodeEditor';
import SlidingPanels from '../components/SlidingPanels';
import { saveToStorage, getFromStorage, storageKeys, clearStorageExcept } from '../utils/storage';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

function MainContent() {
  const { isDarkMode } = useTheme();
  const [problemData, setProblemData] = useState(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved problem data on initial render
  useEffect(() => {
    const loadProblem = () => {
      // First check for POTD
      const storedPotd = localStorage.getItem('problemData');
      if (storedPotd) {
        const potdData = JSON.parse(storedPotd);
        setProblemData(potdData);
        saveToStorage(storageKeys.PROBLEM_DATA, potdData);
        localStorage.removeItem('problemData'); // Clear after loading
        return;
      }

      // If no POTD, check for previously saved problem
      const savedProblem = getFromStorage(storageKeys.PROBLEM_DATA);
      if (savedProblem) {
        setProblemData(savedProblem);
      }
    };

    loadProblem();
  }, []);

  const fetchProblemData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch problem data');
      }
      
      const data = await response.json();
      setProblemData(data);
      saveToStorage(storageKeys.PROBLEM_DATA, data);
      
      // Clear code storage when loading a new problem
      clearStorageExcept([storageKeys.PROBLEM_DATA]);
    } catch (error) {
      console.error('Error fetching problem:', error);
      setError(error.message || 'Failed to fetch problem. Make sure all dependencies are installed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`main-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <div className="left-section">
          <div className="url-input">
            <input
              type="text"
              placeholder="Enter Codeforces problem URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={fetchProblemData} 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>
        <div className="right-section">
          <ThemeToggle />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Make sure to run: <code>npm install puppeteer</code> in your project directory.</p>
        </div>
      )}

      <SlidingPanels
        leftPanel={problemData && <ProblemDetails data={problemData} />}
        rightPanel={
          <CodeEditor 
            testCases={
              problemData && problemData.sampleInputs ? 
                problemData.sampleInputs.map((input, index) => ({
                  input,
                  output: problemData.sampleOutputs?.[index] || ''
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

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: ${isDarkMode ? '#1e1e1e' : 'white'};
          border-bottom: 1px solid ${isDarkMode ? '#333' : '#e2e8f0'};
        }

        .left-section {
          flex: 1;
          margin-right: 1rem;
        }

        .right-section {
          display: flex;
          align-items: center;
        }

        .url-input {
          display: flex;
          gap: 1rem;
          flex: 1;
          margin-right: 1rem;
        }

        input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid ${isDarkMode ? '#444' : '#e2e8f0'};
          border-radius: 4px;
          background: ${isDarkMode ? '#2d2d2d' : 'white'};
          color: ${isDarkMode ? '#fff' : '#000'};
        }

        button {
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }
        
        .error-message {
          padding: 1rem;
          margin: 1rem;
          background-color: ${isDarkMode ? '#352828' : '#fee2e2'};
          color: ${isDarkMode ? '#f87171' : '#b91c1c'};
          border-radius: 4px;
          border-left: 4px solid #ef4444;
        }
        
        code {
          background: ${isDarkMode ? '#1f1f1f' : '#f3f4f6'};
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}
