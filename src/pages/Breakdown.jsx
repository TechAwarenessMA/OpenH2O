import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import ConvoTable from '../components/ConvoTable';

export default function Breakdown() {
  const { hasData, conversations } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <h2 className="text-2xl font-black text-navy mb-4">No data yet</h2>
        <p className="text-slate font-bold mb-6">Upload your conversations.json to see your breakdown.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-navy text-white font-black text-sm uppercase tracking-wider border-4 border-navy hover:bg-black transition-colors"
        >
          Upload Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight">Conversation Breakdown</h1>
        <p className="text-slate font-bold mt-1">
          {conversations.length} conversations sorted by impact
        </p>
      </div>

      <ConvoTable conversations={conversations} />
    </div>
  );
}
