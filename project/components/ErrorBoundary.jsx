import { Component } from 'react';
import { C, F } from '../theme';

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
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ border: `2px solid ${C.ink}`, padding: '32px 28px', maxWidth: '440px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontFamily: F.anton, fontSize: '48px', lineHeight: 1, color: 'transparent', WebkitTextStroke: `2px ${C.ink}`, textTransform: 'uppercase' }}>(!)</span>
          <h2 style={{ fontFamily: F.anton, fontSize: '24px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Something went wrong</h2>
          <p style={{ fontSize: '13.5px', margin: 0, color: C.body, fontWeight: 500, lineHeight: 1.55 }}>An unexpected error occurred. Try reloading the page.</p>
          <button onClick={() => window.location.reload()} className="oh-solid" style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', padding: '12px 20px', alignSelf: 'center' }}>Reload page</button>
        </div>
      </div>
    );
  }
}
