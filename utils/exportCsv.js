/**
 * Export conversation data as a CSV file download.
 */
export function exportConversationsCSV(conversations) {
  const headers = ['Title', 'Source', 'Date', 'Messages', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Energy (kWh)', 'Water (L)', 'Carbon (g CO₂e)'];

  const rows = conversations.map(c => [
    `"${(c.title || 'Untitled').replace(/"/g, '""')}"`,
    c.source || 'unknown',
    c.createdAt || '',
    c.messageCount || 0,
    c.inputTokens || 0,
    c.outputTokens || 0,
    c.totalTokens || 0,
    (c.energyKwh || 0).toFixed(6),
    (c.waterLiters || 0).toFixed(4),
    (c.carbonGrams || 0).toFixed(4),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `openh2o-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
