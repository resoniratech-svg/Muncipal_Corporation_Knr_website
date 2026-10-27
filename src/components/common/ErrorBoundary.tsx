import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full text-center space-y-6">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-heading text-rose-950 uppercase">
              {this.props.fallbackTitle || 'A Component Error Occurred'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              An unexpected issue was caught while rendering this view. Your session and saved data remain safe.
            </p>
            {this.state.error && (
              <div className="bg-white border border-rose-200 rounded-lg p-3 text-left font-mono text-xs text-rose-800 overflow-x-auto max-w-xl mx-auto">
                <span className="font-bold">Error:</span> {this.state.error.message}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-kmc-navy hover:bg-kmc-navy-light text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={() => { window.location.hash = '#/performance'; window.location.reload(); }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Performance Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
