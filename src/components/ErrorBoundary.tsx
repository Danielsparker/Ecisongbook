import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    let message = "Something went wrong.";
    let details = "";

    try {
      const parsed = JSON.parse(error?.message || "");
      if (parsed.error && parsed.operationType) {
        message = `Database Error: ${parsed.operationType} failed.`;
        details = parsed.error;
      }
    } catch (e) {
      message = error?.message || message;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-red-100 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-slate-600 mb-6">{message}</p>
          {details && (
            <pre className="text-xs bg-slate-50 p-4 rounded-xl text-left overflow-auto mb-6 max-h-40">
              {details}
            </pre>
          )}
          <Button onClick={() => window.location.reload()} className="bg-brand-600">
            Reload Application
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
