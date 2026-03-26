import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import ConvoTable from '../components/ConvoTable';
import ConvoDetailPanel from '../components/ConvoDetailPanel';

/** Match a processed conversation back to its raw data by title + date */
function findRawConvo(rawData, convo) {
  if (!rawData) return null;

  // rawData is now { claude: json, chatgpt: json }
  const sourceJson = convo.source ? rawData[convo.source] : null;
  if (!sourceJson) return null;

  const convos = Array.isArray(sourceJson)
    ? sourceJson
    : sourceJson.conversations || sourceJson.chat_messages || Object.values(sourceJson);
  if (!Array.isArray(convos)) return null;

  if (convo.source === 'chatgpt') {
    // ChatGPT: match by title (create_time is a Unix float, createdAt is ISO)
    return convos.find(raw => {
      const rawTitle = raw.title || '';
      const rawDate = raw.create_time ? new Date(raw.create_time * 1000).toISOString() : '';
      return rawTitle === convo.title && rawDate === convo.createdAt;
    }) || null;
  }

  // Claude
  return convos.find(raw => {
    const rawTitle = raw.name || raw.title || '';
    const rawDate = raw.created_at || raw.create_time || '';
    return rawTitle === convo.title && rawDate === convo.createdAt;
  }) || null;
}

export default function Breakdown() {
  const { hasData, conversations, rawData } = useEcoData();
  const navigate = useNavigate();
  const [selectedConvo, setSelectedConvo] = useState(null);

  const rawMatch = useMemo(() => {
    if (!selectedConvo || !rawData) return null;
    return findRawConvo(rawData, selectedConvo);
  }, [selectedConvo, rawData]);

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
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight uppercase">
          Conversation Breakdown
        </h1>
        <p className="text-slate font-bold mt-1">
          {conversations.length} conversations sorted by impact
          {selectedConvo && ' · Click a row to inspect'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Table */}
        <div className={selectedConvo ? 'flex-1 min-w-0' : 'w-full'}>
          <ConvoTable
            conversations={conversations}
            selectedConvo={selectedConvo}
            onSelectConvo={setSelectedConvo}
          />
        </div>

        {/* Right: Detail Panel */}
        {selectedConvo && rawMatch && (
          <div className="w-full lg:w-[420px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-4">
              <ConvoDetailPanel
                convo={selectedConvo}
                rawConvo={rawMatch}
                onClose={() => setSelectedConvo(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
