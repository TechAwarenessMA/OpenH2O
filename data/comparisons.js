/**
 * Real-world comparisons to contextualize environmental impact.
 * Each comparison maps a metric value to a relatable unit.
 *
 * Organized by metric type per spec:
 *   Carbon → miles driven, smartphone charges
 *   Water  → water bottles, minutes of shower
 *   Energy → LED bulb hours, laptop hours
 */

const COMPARISON_DEFS = {
  // ── Energy comparisons ──────────────────────────────────────
  ledHours: {
    /** A 10W LED bulb uses 0.01 kWh per hour */
    perUnit: 0.01,
    emoji: '💡',
    singular: 'hour of LED light',
    plural: 'hours of LED light',
    title: 'LED Bulb Hours',
  },
  laptopHours: {
    /** Average laptop uses ~0.05 kWh per hour */
    perUnit: 0.05,
    emoji: '💻',
    singular: 'hour of laptop use',
    plural: 'hours of laptop use',
    title: 'Laptop Hours',
  },

  // ── Water comparisons ───────────────────────────────────────
  waterBottles: {
    /** A standard water bottle is 0.5 liters */
    perUnit: 0.5,
    emoji: '🧴',
    singular: 'water bottle',
    plural: 'water bottles',
    title: 'Water Bottles',
  },
  showerMinutes: {
    /** Average shower uses ~8 liters per minute */
    perUnit: 8,
    emoji: '🚿',
    singular: 'minute of showering',
    plural: 'minutes of showering',
    title: 'Shower Time',
  },

  // ── Carbon comparisons ──────────────────────────────────────
  milesDriven: {
    /** Average car emits ~404 g CO₂ per mile (EPA 2023) */
    perUnit: 404,
    emoji: '🚗',
    singular: 'mile driven',
    plural: 'miles driven',
    title: 'Miles Driven',
  },
  smartphoneCharges: {
    /** Charging a smartphone emits ~8.22 g CO₂e (avg 12Wh × 685g/kWh) */
    perUnit: 8.22,
    emoji: '🔋',
    singular: 'smartphone charge',
    plural: 'smartphone charges',
    title: 'Smartphone Charges',
  },
};

/**
 * Given totals, compute real-world comparisons.
 * Returns badges in order: [energy1, energy2, water1, water2, carbon1, carbon2]
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

  const led     = compare(totals.energyKwh,   COMPARISON_DEFS.ledHours);
  const laptop  = compare(totals.energyKwh,   COMPARISON_DEFS.laptopHours);
  const bottles = compare(totals.waterLiters,  COMPARISON_DEFS.waterBottles);
  const shower  = compare(totals.waterLiters,  COMPARISON_DEFS.showerMinutes);
  const miles   = compare(totals.carbonGrams,  COMPARISON_DEFS.milesDriven);
  const phone   = compare(totals.carbonGrams,  COMPARISON_DEFS.smartphoneCharges);

  return {
    energy: `~${formatCompare(led.count)} hours of LED light`,
    water: `~${formatCompare(bottles.count)} water bottles`,
    carbon: `~${formatCompare(miles.count)} miles driven`,
    // badges order: [energy, energy, water, water, carbon, carbon]
    badges: [led, laptop, bottles, shower, miles, phone],
  };
}

function formatCompare(n) {
  if (n < 0.01) return n.toFixed(4);
  if (n < 1) return n.toFixed(2);
  if (n < 100) return n.toFixed(1);
  return Math.round(n).toLocaleString();
}
