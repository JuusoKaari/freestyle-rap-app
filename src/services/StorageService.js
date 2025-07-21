/**
 * Centralized localStorage management service with proper error handling
 * Provides consistent API for storing and retrieving data across the app
 * 
 * Features:
 * - Automatic JSON serialization/deserialization
 * - Comprehensive error handling with graceful fallbacks
 * - Legacy data migration (handles old plain-string values)
 * - Storage availability checking
 */

import { logError } from './ErrorService.js';

class StorageService {
  /**
   * Retrieve an item from localStorage with error handling
   * @param {string} key - The localStorage key
   * @param {*} defaultValue - Default value to return if key doesn't exist or error occurs
   * @returns {*} The parsed value or defaultValue
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // Handle legacy data that wasn't JSON-encoded (e.g., plain strings)
        console.warn(`StorageService: Migrating legacy data for key: ${key}`, parseError);
        
        // For certain keys, we know they were stored as plain strings
        if (key === 'language' && typeof item === 'string') {
          // Migrate: re-save as proper JSON and return the value
          this.set(key, item);
          return item;
        }
        
        // For boolean values stored as strings
        if (item === 'true') return true;
        if (item === 'false') return false;
        
        // For other cases, try returning the raw string
        return item;
      }
    } catch (error) {
      logError('StorageService', `Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Store an item in localStorage with error handling
   * @param {string} key - The localStorage key
   * @param {*} value - The value to store (will be JSON.stringify'd)
   * @returns {boolean} True if successful, false if error occurred
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logError('StorageService', `Error writing to localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage with error handling
   * @param {string} key - The localStorage key to remove
   * @returns {boolean} True if successful, false if error occurred
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logError('StorageService', `Error removing from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available and working
   * @returns {boolean} True if localStorage is available
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('StorageService: localStorage is not available', error);
      return false;
    }
  }
}

export default StorageService; 