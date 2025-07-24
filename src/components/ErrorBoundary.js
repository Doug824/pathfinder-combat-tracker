import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center max-w-2xl mx-auto my-8 bg-dark-wood/90 border-2 border-blood-red rounded-lg shadow-fire-red">
          <h2 className="text-3xl font-fantasy font-bold text-blood-red mb-4 uppercase tracking-wider">Something went wrong</h2>
          <p className="text-parchment-dark mb-4">The application encountered an error. This might be due to:</p>
          <ul className="text-left inline-block text-parchment-dark list-disc pl-5 mb-4">
            <li>Firebase connection issues</li>
            <li>Missing environment variables</li>
            <li>Network connectivity problems</li>
          </ul>
          <p className="text-parchment-dark mb-6">Please check your Firebase configuration and try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blood-red hover:bg-red-700 text-parchment-light font-fantasy font-bold uppercase tracking-wider rounded transition-colors cursor-pointer border-2 border-blood-red"
          >
            Refresh Page
          </button>
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-fantasy-gold font-fantasy font-semibold hover:text-ornate-gold">Error Details</summary>
            <pre className="bg-black/60 p-4 rounded mt-2 overflow-auto text-xs text-parchment-dark border border-fantasy-bronze/30">
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;