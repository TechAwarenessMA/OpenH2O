/**
 * Format a number for display.
 * @param {number} n
 * @param {number} decimals - Max decimal places (auto for large numbers)
 * @returns {string}
 */
export function formatNumber(n, decimals) {
  if (n == null || isNaN(n)) return '0';

  if (decimals !== undefined) {
    // For very small numbers, show more precision
    if (n > 0 && n < 0.001) return n.toExponential(2);
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  if (n < 0.01 && n > 0) return n.toExponential(2);
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format a date string for display.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format a month key (YYYY-MM) for display.
 * @param {string} monthKey
 * @returns {string}
 */
export function formatMonth(monthKey) {
  const [year, month] = monthKey.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString(undefined, { year: '2-digit', month: 'short' });
}
