export const storageKeys = {
  PROBLEM_DATA: 'problemData',
  CODE: 'editorCode',
  LANGUAGE: 'selectedLanguage'
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
