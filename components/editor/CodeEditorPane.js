import Editor from "@monaco-editor/react";
import styles from '../../styles/CodeEditor.module.css';

export default function CodeEditorPane({ code, language, onCodeChange, onRunCode, isRunning }) {
  const getLanguageId = () => {
    switch(language.name) {
      case 'C++': return 'cpp';
      case 'Python': return 'python';
      case 'Java': return 'java';
      default: return 'cpp';
    }
  };

  const handleEditorChange = (value) => {
    if (value !== undefined && value !== null) {
      onCodeChange(value);
    }
  };

  return (
    <div className={styles.editorWrapper}>
      <Editor
        height="90vh"
        defaultLanguage={getLanguageId()}
        language={getLanguageId()}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          formatOnType: true,
          formatOnPaste: true,
          tabSize: 4,
        }}
      />
      <div className={styles.editorActions}>
        <button 
          onClick={onRunCode}  // Changed from onRun to onRunCode to match parent prop
          disabled={isRunning}
          className={styles.runButton}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
    </div>
  );
}
