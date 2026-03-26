import { createContext, useContext, useState, useCallback } from 'react';

const EcoDataContext = createContext(null);

const EMPTY_STATE = {
  status: 'idle', // idle | processing | done | error
  rawData: {},       // { claude: json, chatgpt: json }
  sources: [],       // ['claude'] | ['chatgpt'] | ['claude', 'chatgpt']
  totals: null,
  conversations: [],
  monthlyData: [],
  dateRange: { earliest: null, latest: null },
  error: null,
};

export function EcoDataProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE);

  const uploadFile = useCallback(async (file) => {
    setState(s => ({ ...s, status: 'processing', error: null }));
    try {
      let json;

      // Handle ZIP files (ChatGPT exports come as .zip)
      if (file.name.endsWith('.zip')) {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        const convFile = zip.file('conversations.json');
        if (!convFile) {
          throw new Error('No conversations.json found in the ZIP archive.');
        }
        const text = await convFile.async('string');
        json = JSON.parse(text);
      } else {
        const text = await file.text();
        json = JSON.parse(text);
      }

      const { processConversations, mergeResults, detectFormat } = await import('../utils/calculator.js');
      const result = processConversations(json);
      const format = detectFormat(json);

      setState(prev => {
        // If we already have data from a different source, merge
        if (prev.status === 'done' && prev.sources.length > 0 && !prev.sources.includes(format)) {
          const prevResult = {
            totals: prev.totals,
            conversations: prev.conversations,
            monthlyData: prev.monthlyData,
            dateRange: prev.dateRange,
          };
          const merged = mergeResults(prevResult, result);
          return {
            status: 'done',
            rawData: { ...prev.rawData, [format]: json },
            sources: [...prev.sources, format],
            totals: merged.totals,
            conversations: merged.conversations,
            monthlyData: merged.monthlyData,
            dateRange: merged.dateRange,
            error: null,
          };
        }

        // First upload or replacing same source
        return {
          status: 'done',
          rawData: { ...prev.rawData, [format]: json },
          sources: prev.sources.includes(format) ? prev.sources : [...prev.sources.filter(s => s !== format), format],
          totals: result.totals,
          conversations: result.conversations,
          monthlyData: result.monthlyData,
          dateRange: result.dateRange,
          error: null,
        };
      });
    } catch (err) {
      setState(s => ({ ...s, status: 'error', error: err.message }));
    }
  }, []);

  const clearData = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  const value = {
    ...state,
    hasData: state.status === 'done',
    isProcessing: state.status === 'processing',
    uploadFile,
    clearData,
  };

  return (
    <EcoDataContext.Provider value={value}>
      {children}
    </EcoDataContext.Provider>
  );
}

export function useEcoData() {
  const ctx = useContext(EcoDataContext);
  if (!ctx) throw new Error('useEcoData must be used within EcoDataProvider');
  return ctx;
}
