import { useState, useEffect } from 'react';
import { Languages } from '../utils/judge0';
import { saveToStorage, getFromStorage, storageKeys } from '../utils/storage';
import { useCodeExecution } from '../hooks/useCodeExecution';
import TestCaseView from './editor/TestCaseView';
import dynamic from 'next/dynamic';
import styles from '../styles/CodeEditor.module.css';

// Update CodeEditorPane import to be dynamic
const CodeEditorPane = dynamic(
  () => import('./editor/CodeEditorPane'),
  { ssr: false }
);

export default function CodeEditor({ testCases }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = getFromStorage(storageKeys.LANGUAGE);
      return savedLanguage && Languages[savedLanguage] ? Languages[savedLanguage] : Languages.CPP;
    }
    return Languages.CPP;
  });

  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return getFromStorage(storageKeys.CODE) || language.template;
    }
    return language.template;
  });

  const [activeTab, setActiveTab] = useState('code');
  const { results, setResults, isRunning, executeCode } = useCodeExecution();

  useEffect(() => {
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
    if (setResults) {
      setResults([]);
      setActiveTab('code');
    }
  }, [testCases, setResults]);

  useEffect(() => {
    saveToStorage(storageKeys.CODE, code);
  }, [code]);

  useEffect(() => {
    saveToStorage(storageKeys.LANGUAGE, language.name);
  }, [language]);

  const handleLanguageChange = (e) => {
    const newLanguage = Object.values(Languages).find(
      lang => lang.id === parseInt(e.target.value)
    ) || Languages.CPP;
    
    setLanguage(newLanguage);
    saveToStorage(storageKeys.LANGUAGE, newLanguage.name);
    
    const savedCode = getFromStorage(storageKeys.CODE);
    if (!savedCode) {
      setCode(newLanguage.template);
      saveToStorage(storageKeys.CODE, newLanguage.template);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    saveToStorage(storageKeys.CODE, value);
  };

  const handleCodeRun = async () => {
    const newResults = await executeCode(code, testCases, language.id);
    setActiveTab('testcases');
  };

  if (!language) return null;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <div className={styles.languageSelector}>
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
        <div className={styles.editorTabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'code' ? styles.active : ''}`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'testcases' ? styles.active : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            Sample Cases ({testCases.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Input
          </button>
        </div>
      </div>

      <div className={styles.editorContent}>
        {activeTab === 'code' ? (
          <CodeEditorPane 
            code={code}
            onCodeChange={handleCodeChange}
            onRunCode={handleCodeRun}
            isRunning={isRunning}
            language={language}
          />
        ) : (
          <TestCaseView 
            testCases={testCases}
            results={results}
            isRunning={isRunning}
            onRunCode={handleCodeRun}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
}
