import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber, formatDate } from '../utils/formatters';

const PAGE_SIZE = 20;

const SORT_KEYS = [
  { key: 'totalTokens', label: 'Tokens' },
  { key: 'energyKwh', label: 'Energy' },
  { key: 'waterLiters', label: 'Water' },
  { key: 'carbonGrams', label: 'Carbon' },
  { key: 'messageCount', label: 'Messages' },
];

export default function ConvoTable({ conversations }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('totalTokens');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    let result = conversations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => (c.title || '').toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      const av = a[sortKey] || 0;
      const bv = b[sortKey] || 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return result;
  }, [conversations, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const isTop5 = (convo) => {
    const sorted = [...conversations].sort((a, b) => b.totalTokens - a.totalTokens);
    return sorted.slice(0, 5).includes(convo);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 border-4 border-navy bg-white px-4 py-2">
        <Search size={18} className="text-slate" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 bg-transparent outline-none text-sm font-bold text-ink placeholder:text-slate/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-coral font-black">Clear</button>
        )}
      </div>

      <p className="text-xs text-slate font-bold">{filtered.length} conversations</p>

      {/* Table */}
      <div className="border-4 border-navy bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-4 border-navy bg-cream">
              <th className="text-left py-3 px-3 font-black text-navy uppercase tracking-wider text-xs w-2/5">
                Conversation
              </th>
              {SORT_KEYS.map(({ key, label }) => (
                <th
                  key={key}
                  className="text-right py-3 px-3 font-black text-navy uppercase tracking-wider text-xs cursor-pointer hover:text-green transition-colors"
                  onClick={() => toggleSort(key)}
                >
                  <span className="flex items-center justify-end gap-1">
                    {label}
                    {sortKey === key && (
                      sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((convo, i) => (
              <tr key={i}>
                <td colSpan={SORT_KEYS.length + 1} className="p-0">
                  <div
                    className={`flex items-center cursor-pointer hover:bg-cream/50 transition-colors ${
                      isTop5(convo) ? 'border-l-4 border-coral' : ''
                    }`}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div className="py-3 px-3 w-2/5">
                      <p className="font-bold text-ink truncate">{convo.title || 'Untitled'}</p>
                      <p className="text-xs text-slate font-bold">{formatDate(convo.createdAt)}</p>
                    </div>
                    <div className="py-3 px-3 text-right font-bold text-ink flex-1">{formatNumber(convo.totalTokens)}</div>
                    <div className="py-3 px-3 text-right font-bold text-ink flex-1">{formatNumber(convo.energyKwh, 6)}</div>
                    <div className="py-3 px-3 text-right font-bold text-ink flex-1">{formatNumber(convo.waterLiters, 4)}</div>
                    <div className="py-3 px-3 text-right font-bold text-ink flex-1">{formatNumber(convo.carbonGrams, 4)}</div>
                    <div className="py-3 px-3 text-right font-bold text-ink flex-1">{convo.messageCount}</div>
                  </div>

                  {/* Expanded details */}
                  {expanded === i && (
                    <div className="px-3 pb-3 bg-cream border-t-2 border-navy/10 animate-fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
                        <div>
                          <p className="text-xs text-slate font-black uppercase tracking-wider">User Tokens</p>
                          <p className="text-sm font-black text-navy">{formatNumber(convo.userTokens)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate font-black uppercase tracking-wider">Assistant Tokens</p>
                          <p className="text-sm font-black text-navy">{formatNumber(convo.assistantTokens)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate font-black uppercase tracking-wider">Messages</p>
                          <p className="text-sm font-black text-navy">{convo.messageCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate font-black uppercase tracking-wider">Date</p>
                          <p className="text-sm font-black text-navy">{formatDate(convo.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-2 border-4 border-navy font-black text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-navy hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-xs font-black text-slate uppercase tracking-wider">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-2 border-4 border-navy font-black text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-navy hover:text-white transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Top 5 legend */}
      <div className="flex items-center gap-2 text-xs text-slate font-bold">
        <div className="w-4 h-3 border-l-4 border-coral" />
        <span>Top 5 most resource-intensive conversations</span>
      </div>
    </div>
  );
}
