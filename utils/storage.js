export const storageKeys = {
  PROBLEM_DATA: 'problemData',
  CODE: 'editorCode',
  LANGUAGE: 'selectedLanguage',
  CUSTOM_TEST_CASES: 'customTestCases',
  CPP_CODE: 'cppCode',
  PYTHON_CODE: 'pythonCode',
  JAVA_CODE: 'javaCode',
};

export function saveToStorage(key, data) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getFromStorage(key) {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export function clearStorageExcept(keysToKeep) {
  if (typeof window === 'undefined') return;
  
  try {
    const itemsToKeep = {};
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) itemsToKeep[key] = value;
    });
    
    localStorage.clear();
    
    Object.entries(itemsToKeep).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
