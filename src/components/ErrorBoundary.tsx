import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Tamil Worship Lyrics UI ErrorBoundary caught an error:', error, errorInfo);
  }

  handleResetCacheAndReload = () => {
    try {
      localStorage.removeItem('eci_cached_songs');
      localStorage.removeItem('eci_presentation_state');
      sessionStorage.removeItem('eci_session_external_songs');
    } catch {
      // Ignore storage access errors
    }
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      let message = 'Something went wrong while rendering this view.';
      let details = '';

      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error && parsed.operationType) {
          message = `Database Error: ${parsed.operationType} failed.`;
          details = parsed.error;
        }
      } catch {
        message = this.state.error?.message || message;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-red-100 dark:border-red-900/50 max-w-md w-full space-y-5">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Oops! Something went wrong</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 break-words">{message}</p>
            {details && (
              <pre className="text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-left overflow-auto max-h-40 text-slate-700 dark:text-slate-300">
                {details}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => window.location.reload()} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                Reload Application
              </Button>
              <Button
                variant="outline"
                onClick={this.handleResetCacheAndReload}
                className="rounded-xl border-slate-200 dark:border-slate-700"
              >
                Reset Cache &amp; Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

