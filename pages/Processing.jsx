import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';

const statusMessages = [
  'Reading your conversations...',
  'Counting tokens...',
  'Calculating energy usage...',
  'Estimating water consumption...',
  'Computing carbon emissions...',
  'Generating comparisons...',
  'Almost there...',
];

export default function Processing() {
  const { status, hasData, error } = useEcoData();
  const navigate = useNavigate();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (hasData) {
      setProgress(100);
      const timer = setTimeout(() => navigate('/dashboard'), 600);
      return () => clearTimeout(timer);
    }
  }, [hasData, navigate]);

  useEffect(() => {
    if (status === 'idle') {
      navigate('/');
    }
  }, [status, navigate]);

  useEffect(() => {
    if (!hasData) {
      const interval = setInterval(() => {
        setMsgIndex(i => (i + 1) % statusMessages.length);
        setProgress(p => Math.min(p + 12, 90));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [hasData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-black text-navy text-center mb-8">
          Analyzing Your Impact
        </h2>

        {/* Progress bar */}
        <div className="border-4 border-navy bg-white h-8 mb-6">
          <div
            className="h-full bg-green transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, animation: 'progressFill 0.5s ease-out' }}
          />
        </div>

        {/* Status message */}
        <p className="text-center font-bold text-slate text-sm animate-pulse-slow">
          {statusMessages[msgIndex]}
        </p>

        {error && (
          <div className="mt-8 p-4 border-4 border-coral bg-coral/10">
            <p className="font-black text-sm text-coral mb-2">Something went wrong</p>
            <p className="text-xs text-ink font-bold">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-navy text-white font-black text-sm uppercase tracking-wider border-4 border-navy hover:bg-black transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
