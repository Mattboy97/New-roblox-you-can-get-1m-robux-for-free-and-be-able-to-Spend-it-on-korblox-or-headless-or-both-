import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) {
          errorMessage = `Firebase Error: ${parsed.error} (${parsed.operationType} at ${parsed.path})`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-black mb-4">Oops! Something went wrong.</h1>
          <p className="text-gray-400 mb-8 max-w-md">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black rounded-full font-bold"
          >
            Reload App
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
