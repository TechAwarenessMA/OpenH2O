import { createContext, useContext, useState, useCallback } from 'react';

const EcoDataContext = createContext(null);

export function EcoDataProvider({ children }) {
  const [state, setState] = useState({
    status: 'idle', // idle | processing | done | error
    rawData: null,
    totals: null,
    conversations: [],
    monthlyData: [],
    error: null,
  });

  const uploadFile = useCallback(async (file) => {
    setState(s => ({ ...s, status: 'processing', error: null }));
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Dynamic import to keep initial bundle small
      const { processConversations } = await import('../utils/calculator.js');
      const result = processConversations(json);

      setState({
        status: 'done',
        rawData: json,
        totals: result.totals,
        conversations: result.conversations,
        monthlyData: result.monthlyData,
        error: null,
      });
    } catch (err) {
      setState(s => ({ ...s, status: 'error', error: err.message }));
    }
  }, []);

  const clearData = useCallback(() => {
    setState({
      status: 'idle',
      rawData: null,
      totals: null,
      conversations: [],
      monthlyData: [],
      error: null,
    });
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
