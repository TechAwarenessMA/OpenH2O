import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div
          className="bg-white border-4 border-navy p-8 max-w-md w-full text-center"
          style={{ boxShadow: '8px 8px 0px 0px #FB4B5F' }}
        >
          <div className="w-12 h-12 bg-coral/10 border-2 border-coral flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-coral" />
          </div>
          <h2 className="text-xl font-black text-navy uppercase tracking-wider mb-2">
            Something went wrong
          </h2>
          <p className="text-sm font-bold text-slate mb-6">
            An unexpected error occurred. Try reloading the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-sunshine text-ink font-black text-sm uppercase tracking-wider border-4 border-navy hover:-translate-y-0.5 transition-transform"
            style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
