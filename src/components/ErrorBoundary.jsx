/**
 * ErrorBoundary.jsx
 * React Error Boundary component to catch JavaScript errors in component tree,
 * log them, and display a fallback UI instead of crashing the entire app.
 */

import React from 'react';
import { logError, showUserError } from '../services/ErrorService.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with context
    const context = this.props.context || 'ErrorBoundary';
    const errorMessage = `React Error Boundary caught error: ${error.message}`;
    
    logError(context, errorMessage, error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    // Show user-friendly error message
    const userMessage = this.props.userMessage || 
      'Something went wrong. The app will try to recover automatically.';
    
    showUserError(userMessage, error);

    // Store error details in state for debugging
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Reset error state to try rendering again
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '16px',
            color: '#dc3545'
          }}>
            ⚠️ Something went wrong
          </div>
          
          <div style={{
            fontSize: '16px',
            marginBottom: '20px',
            color: '#6c757d',
            lineHeight: '1.5'
          }}>
            {this.props.userMessage || 
             'The application encountered an error. You can try refreshing the page or contact support if the problem persists.'}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Refresh Page
            </button>
          </div>

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              fontSize: '12px',
              color: '#495057',
              backgroundColor: '#e9ecef',
              padding: '10px',
              borderRadius: '4px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                marginTop: '10px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
                {this.state.errorInfo && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return React.forwardRef((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
};

// Hook for throwing errors to be caught by ErrorBoundary
export const useThrowError = () => {
  const [, setError] = React.useState();
  
  return React.useCallback((error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

export default ErrorBoundary; 