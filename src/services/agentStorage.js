// Storage utility to save and load agents persistently

const STORAGE_KEY = 'a2a_agents';

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
 * Load agents from persistent storage
 * @returns {Array} Array of agent objects
 */
export const loadAgents = () => {
  try {
    const storage = getStorage();
    const storedAgents = storage.getItem(STORAGE_KEY);
    return storedAgents ? JSON.parse(storedAgents) : [];
  } catch (error) {
    console.error('Error loading agents from storage:', error);
    return [];
  }
};

/**
 * Save agents to persistent storage
 * @param {Array} agents Array of agent objects to save
 */
export const saveAgents = (agents) => {
  try {
    const storage = getStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(agents));
    console.info(`Saved ${agents.length} agent(s) to storage`);
  } catch (error) {
    console.error('Error saving agents to storage:', error);
  }
};

/**
 * Clear all stored agents
 */
export const clearAgents = () => {
  try {
    const storage = getStorage();
    storage.removeItem(STORAGE_KEY);
    console.info('Cleared all agents from storage');
  } catch (error) {
    console.error('Error clearing agents from storage:', error);
  }
};

/**
 * Export agents to a JSON string for sharing or backup
 * @returns {string} JSON string of agent configurations
 */
export const exportAgents = () => {
  try {
    const agents = loadAgents();
    return JSON.stringify(agents, null, 2);
  } catch (error) {
    console.error('Error exporting agents:', error);
    throw new Error(`Failed to export agents: ${error.message}`);
  }
};

/**
 * Import agents from a JSON string
 * @param {string} jsonString JSON string containing agent configurations
 * @returns {Array} Array of imported agent objects
 */
export const importAgents = (jsonString) => {
  try {
    const parsedAgents = JSON.parse(jsonString);
    
    // Basic validation
    if (!Array.isArray(parsedAgents)) {
      throw new Error('Invalid format: agents must be an array');
    }
    
    // Validate each agent has required fields
    parsedAgents.forEach((agent, index) => {
      if (!agent.name || !agent.url) {
        throw new Error(`Invalid agent at position ${index}: missing required fields`);
      }
    });
    
    // Save the imported agents
    saveAgents(parsedAgents);
    return parsedAgents;
  } catch (error) {
    console.error('Error importing agents:', error);
    throw new Error(`Failed to import agents: ${error.message}`);
  }
}; 