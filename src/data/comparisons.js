/**
 * Real-world comparisons to contextualize environmental impact.
 */

const COMPARISON_DEFS = {
  // Energy comparisons
  ledHours: {
    /** A 10W LED bulb uses 0.01 kWh per hour */
    perUnit: 0.01,
    emoji: '💡',
    singular: 'hour of LED light',
    plural: 'hours of LED light',
    title: 'LED Bulb Hours',
  },
  phoneCharges: {
    /** Charging a smartphone uses ~0.012 kWh */
    perUnit: 0.012,
    emoji: '🔋',
    singular: 'smartphone charge',
    plural: 'smartphone charges',
    title: 'Phone Charges',
  },

  // Water comparisons
  waterBottles: {
    /** A standard water bottle is 0.5 liters */
    perUnit: 0.5,
    emoji: '🧴',
    singular: 'water bottle',
    plural: 'water bottles',
    title: 'Water Bottles',
  },
  showerSeconds: {
    /** A shower uses ~0.13 liters per second (~8 L/min) */
    perUnit: 0.13,
    emoji: '🚿',
    singular: 'second of showering',
    plural: 'seconds of showering',
    title: 'Shower Time',
  },

  // Carbon comparisons
  milesDriven: {
    /** Average car emits ~404 g CO₂ per mile (EPA) */
    perUnit: 404,
    emoji: '🚗',
    singular: 'mile driven',
    plural: 'miles driven',
    title: 'Miles Driven',
  },
  googleSearches: {
    /** A Google search emits ~0.2 g CO₂ */
    perUnit: 0.2,
    emoji: '🔍',
    singular: 'Google search',
    plural: 'Google searches',
    title: 'Google Searches',
  },
};

/**
 * Given totals, compute real-world comparisons.
 * @param {{ energyKwh: number, waterLiters: number, carbonGrams: number }} totals
 */
export function getComparisons(totals) {
  const compare = (value, def) => {
    const count = value / def.perUnit;
    return {
      count,
      emoji: def.emoji,
      title: def.title,
      description: `Equivalent to ${formatCompare(count)} ${count === 1 ? def.singular : def.plural}`,
    };
  };

  const led = compare(totals.energyKwh, COMPARISON_DEFS.ledHours);
  const phone = compare(totals.energyKwh, COMPARISON_DEFS.phoneCharges);
  const bottles = compare(totals.waterLiters, COMPARISON_DEFS.waterBottles);
  const shower = compare(totals.waterLiters, COMPARISON_DEFS.showerSeconds);
  const miles = compare(totals.carbonGrams, COMPARISON_DEFS.milesDriven);
  const searches = compare(totals.carbonGrams, COMPARISON_DEFS.googleSearches);

  return {
    energy: `~${formatCompare(led.count)} hours of LED light`,
    water: `~${formatCompare(bottles.count)} water bottles`,
    carbon: `~${formatCompare(searches.count)} Google searches`,
    badges: [led, phone, bottles, shower, miles, searches],
  };
}

function formatCompare(n) {
  if (n < 0.01) return n.toFixed(4);
  if (n < 1) return n.toFixed(2);
  if (n < 100) return n.toFixed(1);
  return Math.round(n).toLocaleString();
}
