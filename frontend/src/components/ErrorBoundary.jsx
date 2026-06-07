import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-gutter">
          <div className="max-w-lg w-full text-center">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-6">
              System Error
            </span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
              Something went wrong
            </h1>
            <div className="w-16 h-px bg-primary mx-auto mb-8" />
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
              An unexpected error occurred. Please return to the homepage.
            </p>
            <button
              onClick={() => this.handleReset()}
              className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
