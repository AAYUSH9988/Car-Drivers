import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.641-1.283.876-2.116L13.166 1.94a1.5 1.5 0 00-2.332 0L2.078 18.884c-.765.833-.178 2.116.876 2.116z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-8">
              We apologize for the inconvenience. Please try refreshing the page or return to the home page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-gold text-bg-base font-semibold rounded-xl hover:shadow-glow-gold transition-all"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-border text-text-primary font-medium rounded-xl hover:border-gold/50 transition-all"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;