// Storage utility to save and load application settings persistently

const STORAGE_KEY = 'a2a_settings';

/**
 * Check if localStorage is available
 * @returns {boolean} Whether localStorage is available
 */
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get storage implementation
 * @returns {Object} Storage implementation with getItem, setItem, and removeItem methods
 */
const getStorage = () => {
  if (isStorageAvailable()) {
    return localStorage;
  }
  
  // Fallback to in-memory storage if localStorage is not available
  console.warn('localStorage not available, using in-memory storage');
  const memoryStorage = {};
  return {
    getItem: (key) => memoryStorage[key] || null,
    setItem: (key, value) => { memoryStorage[key] = value; },
    removeItem: (key) => { delete memoryStorage[key]; }
  };
};

/**
 * Get default settings
 * @returns {Object} Default settings object
 */
const getDefaultSettings = () => {
  return {
    logEnabled: true,
    // Add other default settings here as needed
  };
};

/**
 * Load settings from persistent storage
 * @returns {Object} Settings object
 */
export const loadSettings = () => {
  try {
    const storage = getStorage();
    const storedSettings = storage.getItem(STORAGE_KEY);
    const defaultSettings = getDefaultSettings();
    
    if (!storedSettings) {
      return defaultSettings;
    }
    
    // Merge stored settings with defaults (to handle new settings added in updates)
    return { ...defaultSettings, ...JSON.parse(storedSettings) };
  } catch (error) {
    console.error('Error loading settings from storage:', error);
    return getDefaultSettings();
  }
};

/**
 * Save settings to persistent storage
 * @param {Object} settings Settings object to save
 */
export const saveSettings = (settings) => {
  try {
    const storage = getStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(settings));
    console.info('Settings saved to storage');
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

/**
 * Reset settings to defaults
 * @returns {Object} Default settings object
 */
export const resetSettings = () => {
  try {
    const defaultSettings = getDefaultSettings();
    saveSettings(defaultSettings);
    console.info('Settings reset to defaults');
    return defaultSettings;
  } catch (error) {
    console.error('Error resetting settings:', error);
    return getDefaultSettings();
  }
}; 