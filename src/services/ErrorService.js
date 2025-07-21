/**
 * ErrorService.js
 * Centralized error handling service for consistent error management,
 * user notifications, and error logging throughout the Freestyle Rap App.
 */

class ErrorService {
  static instance = null;
  
  constructor() {
    this.toastContainer = null;
    this.toastQueue = [];
    this.init();
  }

  static getInstance() {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  init() {
    this.createToastContainer();
  }

  createToastContainer() {
    if (document.getElementById('toast-container')) {
      this.toastContainer = document.getElementById('toast-container');
      return;
    }

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    this.toastContainer = container;
  }

  /**
   * Show a toast notification to the user
   */
  showToast(message, type = 'error', duration = 5000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      pointer-events: auto;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      max-width: 100%;
      word-wrap: break-word;
      position: relative;
    `;

    // Add animation styles if not already present
    if (!document.getElementById('toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }

    toast.textContent = message;
    
    // Click to dismiss
    toast.addEventListener('click', () => {
      this.removeToast(toast);
    });

    this.toastContainer.appendChild(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);
    }

    return toast;
  }

  removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  getToastColor(type) {
    const colors = {
      error: '#dc3545',
      warning: '#ffc107',
      success: '#28a745',
      info: '#17a2b8'
    };
    return colors[type] || colors.error;
  }

  /**
   * Log error with consistent formatting
   */
  logError(context, message, error = null, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] 🚨 ${context}: ${message}`;
    
    console.error(logMessage, error || '', data || '');
    
    // Could be extended to send to analytics service
    this.trackError(context, message, error);
  }

  /**
   * Log warning with consistent formatting
   */
  logWarning(context, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ⚠️ ${context}: ${message}`;
    
    console.warn(logMessage, data || '');
  }

  /**
   * Log info with consistent formatting
   */
  logInfo(context, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ℹ️ ${context}: ${message}`;
    
    console.log(logMessage, data || '');
  }

  /**
   * Handle user-facing errors (replaces alert())
   */
  showUserError(message, error = null) {
    this.showToast(message, 'error');
    if (error) {
      this.logError('UserError', message, error);
    }
  }

  /**
   * Handle user-facing warnings
   */
  showUserWarning(message) {
    this.showToast(message, 'warning');
    this.logWarning('UserWarning', message);
  }

  /**
   * Handle user-facing success messages
   */
  showUserSuccess(message) {
    this.showToast(message, 'success');
    this.logInfo('UserSuccess', message);
  }

  /**
   * Handle critical errors that should be reported
   */
  handleCriticalError(context, error, userMessage = null) {
    const message = userMessage || 'An unexpected error occurred. Please try again.';
    
    this.logError(context, 'Critical error occurred', error);
    this.showUserError(message, error);
    
    // Could be extended to send to error reporting service
    this.reportError(context, error);
  }

  /**
   * Track error for analytics (placeholder)
   */
  trackError(context, message, error) {
    // This could be connected to analytics service
    // For now, just log to localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        context,
        message,
        error: error ? error.toString() : null,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      // If even logging fails, at least log to console
      console.error('Failed to log error to localStorage:', e);
    }
  }

  /**
   * Report error to external service (placeholder)
   */
  reportError(context, error) {
    // Placeholder for external error reporting
    // Could integrate with services like Sentry, Bugsnag, etc.
  }

  /**
   * Get recent error logs (for debugging)
   */
  getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch (e) {
      this.logError('ErrorService', 'Failed to retrieve error logs', e);
      return [];
    }
  }

  /**
   * Clear error logs
   */
  clearErrorLogs() {
    try {
      localStorage.removeItem('errorLogs');
      this.logInfo('ErrorService', 'Error logs cleared');
    } catch (e) {
      this.logError('ErrorService', 'Failed to clear error logs', e);
    }
  }
}

// Create singleton instance and export methods for easy use
const errorService = ErrorService.getInstance();

export const {
  showToast,
  showUserError,
  showUserWarning,
  showUserSuccess,
  logError,
  logWarning,
  logInfo,
  handleCriticalError,
  getErrorLogs,
  clearErrorLogs
} = errorService;

export default ErrorService; 