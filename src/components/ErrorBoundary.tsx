import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // @ts-ignore
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              কিছু একটা সমস্যা হয়েছে (Application Notice)
            </h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              সফটওয়্যারটি রিলোড করে পুনরায় চালু করুন অথবা হোম পেজে ফিরে যান। আপনার ডেটা সম্পূর্ণ নিরাপদ আছে।
            </p>

            {/* @ts-ignore */}
            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left mb-6 overflow-x-auto">
                <p className="text-xs font-mono text-slate-500 break-all">
                  {/* @ts-ignore */}
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  window.location.hash = '#/';
                  window.location.reload();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-sm transition-colors"
              >
                <Home className="w-4 h-4" />
                হোমে ফিরুন
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                রিলোড করুন
              </button>
            </div>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
