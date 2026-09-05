import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by DealFlow360 ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="card max-w-lg w-full p-6 text-center border-red-500/30">
            <div className="text-4xl mb-3">🚨</div>
            <h2 className="text-lg font-bold text-foreground">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 mb-4 leading-relaxed">
              An unexpected client runtime exception occurred. The DealFlow360 fault isolation engine has safely contained this error.
            </p>

            {this.state.error && (
              <div className="p-3 mb-5 bg-red-500/10 border border-red-500/20 rounded-lg text-left text-xs font-mono text-red-400 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm text-xs"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm text-xs"
                onClick={this.handleReload}
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
