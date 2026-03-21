/**
 * Environmental impact coefficients for AI inference calculations.
 *
 * ⭐ THE MOST IMPORTANT FILE FOR FUTURE MAINTAINERS ⭐
 *
 * To update: change the value, update the source comment, increment version
 * by 0.1, update lastUpdated. No other files need to change.
 *
 * All figures are estimates. Actual values vary by data center, hardware,
 * model, and region.
 */
export const COEFFICIENTS = {
  /** Semantic version — increment by 0.1 whenever any value changes */
  version: '1.1',

  /** Date these coefficients were last reviewed against published literature */
  lastUpdated: 'March 2026',

  /**
   * Energy (Wh) consumed per OUTPUT token during inference.
   * Output tokens cost ~3-5x more than input (autoregressive generation).
   * Source: Luccioni et al. 2023, "Power Hungry Processing"
   */
  energy_per_output_token_wh: 0.000195,

  /**
   * Energy (Wh) consumed per INPUT token during inference.
   * Input pass is a single forward pass — significantly cheaper than output.
   * Source: Luccioni et al. 2023
   */
  energy_per_input_token_wh: 0.0000039,

  /**
   * Power Usage Effectiveness — ratio of total data center energy
   * to energy used by computing equipment.
   * 1.0 = perfect efficiency. Industry avg: 1.1–1.5. Hyperscalers: ~1.1–1.2.
   * Source: Anthropic datacenter PUE estimate (industry average)
   */
  pue_multiplier: 1.2,

  /**
   * Liters of water consumed per kWh of data center energy.
   * Includes direct cooling water evaporation.
   * Source: EESI 2024 — 1,900 L/MWh direct cooling, converted to per-kWh
   */
  direct_water_per_kwh_liters: 1.9,

  indirect_water_per_kwh_liters: 4.5,

  /**
   * Grams of CO₂e emitted per kWh of electricity.
   * US average grid carbon intensity. Anthropic uses US East region.
   * Source: EPA eGRID 2023
   */
  carbon_per_kwh_gco2e: 340,

  /**
   * Default model label — Claude export does not include per-message model data.
   * Coefficients above are calibrated for Claude Sonnet 4.6.
   */
  model_label: 'Claude Sonnet 4.6',

  /**
   * Honest uncertainty range for all estimates (±%).
   * Displayed in UI to prevent misrepresentation of estimates as measurements.
   */
  uncertainty_range_pct: 50,

  /** Source citations */
  sources: {
    energy: ['Luccioni et al. 2023, "Power Hungry Processing"', '2024 United States Data Center Energy Usage Report'],
    pue: 'Anthropic datacenter estimate; industry avg 1.1–1.5',
    water: ['EESI 2024, direct cooling: 1,900 L/MWh', '2024 United States Data Center Energy Usage Report'],
    carbon: ['EPA eGRID 2023, US national average', '2024 United States Data Center Energy Usage Report']
  },
};
