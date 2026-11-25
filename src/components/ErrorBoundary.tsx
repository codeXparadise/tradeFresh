import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Unexpected rendering error occurred.',
    };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          backgroundColor: 'var(--tf-bg)',
          color: 'var(--tf-ink)',
        }}
      >
        <div
          className="tf-card tf-shake-error"
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            display: 'grid',
            gap: '14px',
            textAlign: 'center',
          }}
        >
          <div style={{ margin: '0 auto', color: 'var(--tf-live)' }}>
            <AlertTriangle size={36} />
          </div>
          <h1 className="tf-heading-font" style={{ margin: 0, fontSize: '26px' }}>
            Desk view interrupted
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--tf-muted)' }}>
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, message: '' });
              window.location.assign('/');
            }}
            className="tf-btn tf-btn-primary"
            style={{ justifySelf: 'center' }}
          >
            <RotateCcw size={16} />
            Reload Trade Fresh
          </button>
        </div>
      </main>
    );
  }
}
