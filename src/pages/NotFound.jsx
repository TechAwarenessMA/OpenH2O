import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 animate-fade-in">
      <div
        className="bg-white border-4 border-navy p-8 max-w-md w-full text-center"
        style={{ boxShadow: '8px 8px 0px 0px #FAC206' }}
      >
        <p className="text-6xl font-black text-navy mb-2">404</p>
        <h2 className="text-xl font-black text-navy uppercase tracking-wider mb-2">
          Page Not Found
        </h2>
        <p className="text-sm font-bold text-slate mb-6">
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-sunshine text-ink font-black text-sm uppercase tracking-wider border-4 border-navy hover:-translate-y-0.5 transition-transform"
          style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
