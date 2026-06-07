import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('🛑 React Error Boundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              marginBottom: 12,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: 'var(--secondary)',
              maxWidth: 480,
              marginBottom: 24,
            }}
          >
            The page crashed unexpectedly. This is usually caused by a browser
            extension (password manager / autofill) conflicting with the app.
          </p>
          <pre
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              fontSize: '0.75rem',
              maxWidth: 600,
              overflow: 'auto',
              marginBottom: 24,
              color: 'var(--error)',
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
