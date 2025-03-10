import { useState, useEffect } from 'react';
import { Languages } from '../utils/judge0';
import { saveToStorage, getFromStorage, storageKeys } from '../utils/storage';
import { useCodeExecution } from '../hooks/useCodeExecution';
import TestCaseView from './editor/TestCaseView';
import dynamic from 'next/dynamic';
import styles from '../styles/CodeEditor.module.css';
import CustomTestCase from './editor/CustomTestCase';

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

  const [cppCode, setCppCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return getFromStorage(storageKeys.CPP_CODE) || Languages.CPP.template;
    }
    return Languages.CPP.template;
  });

  const [pythonCode, setPythonCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return getFromStorage(storageKeys.PYTHON_CODE) || Languages.PYTHON.template;
    }
    return Languages.PYTHON.template;
  });

  const [javaCode, setJavaCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return getFromStorage(storageKeys.JAVA_CODE) || Languages.JAVA.template;
    }
    return Languages.JAVA.template;
  });

  const [activeTab, setActiveTab] = useState('code');
  const { results, setResults, isRunning, executeCode } = useCodeExecution();

  // Update useEffect to load saved code only once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = getFromStorage(storageKeys.LANGUAGE);
      
      if (savedLanguage && Languages[savedLanguage]) {
        setLanguage(Languages[savedLanguage]);
      }
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (setResults) {
      setResults([]);
      setActiveTab('code');
    }
  }, [testCases, setResults]);

  useEffect(() => {
    saveToStorage(storageKeys.LANGUAGE, language.name);
  }, [language]);

  const getCurrentCode = () => {
    switch(language.name) {
      case 'C++': return cppCode;
      case 'Python': return pythonCode;
      case 'Java': return javaCode;
      default: return cppCode;
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = Object.values(Languages).find(
      lang => lang.id === parseInt(e.target.value)
    ) || Languages.CPP;
    setLanguage(newLanguage);
  };

  const handleCodeChange = (newCode) => {
    if (newCode === undefined || newCode === null) return;

    switch(language.name) {
      case 'C++':
        setCppCode(newCode);
        saveToStorage(storageKeys.CPP_CODE, newCode);
        break;
      case 'Python':
        setPythonCode(newCode);
        saveToStorage(storageKeys.PYTHON_CODE, newCode);
        break;
      case 'Java':
        setJavaCode(newCode);
        saveToStorage(storageKeys.JAVA_CODE, newCode);
        break;
    }
  };

  const handleCodeRun = async () => {
    const currentCode = getCurrentCode();
    const newResults = await executeCode(currentCode, testCases, language.id);
    setActiveTab('testcases');
  };

  const handleCustomTest = async (input, expectedOutput) => {
    const result = await executeCode(getCurrentCode(), [{
      input,
      output: expectedOutput
    }], language.id);
    return result[0];
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
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
            onClick={() => handleTabChange('code')}
          >
            Code
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'testcases' ? styles.active : ''}`}
            onClick={() => handleTabChange('testcases')}
          >
            Sample Cases ({testCases.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => handleTabChange('custom')}
          >
            Custom Input
          </button>
        </div>
      </div>

      <div className={styles.editorContent}>
        {activeTab === 'code' ? (
          <CodeEditorPane 
            code={getCurrentCode()}
            onCodeChange={handleCodeChange}
            onRunCode={handleCodeRun} // Changed from onRun to onRunCode
            isRunning={isRunning}
            language={language}
          />
        ) : activeTab === 'custom' ? (
          <CustomTestCase onRunTest={handleCustomTest} />
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
