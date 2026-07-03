/**
 * Environmental impact coefficients for GPT-5 inference.
 *
 * These values are calibrated for GPT-5 (released August 2025).
 * Infrastructure values (PUE, water, carbon) are shared with Claude
 * since they depend on data center, not model.
 *
 * Sources:
 *   - Epoch AI: "How much energy does ChatGPT use?" (2025)
 *   - Tom's Hardware: GPT-5 power consumption estimates (2025)
 *   - University of Rhode Island AI Lab research
 */
export const GPT_COEFFICIENTS = {
  version: '1.0',
  lastUpdated: 'March 2026',

  /**
   * Energy (Wh) consumed per OUTPUT token during inference.
   * GPT-5 is significantly more energy-intensive than Claude due to
   * larger model size and reasoning capabilities.
   * Based on ~4 Wh per 1000-token response (Epoch AI methodology).
   */
  energy_per_output_token_wh: 0.004,

  /**
   * Energy (Wh) consumed per INPUT token during inference.
   * ~1/50th of output cost (forward pass vs autoregressive generation).
   */
  energy_per_input_token_wh: 0.00008,

  /** PUE — same as Claude (infrastructure-dependent, not model-dependent) */
  pue_multiplier: 1.2,

  /** Water — same as Claude (infrastructure-dependent) */
  direct_water_per_kwh_liters: 1.9,
  indirect_water_per_kwh_liters: 4.5,

  /** Carbon — same as Claude (US average grid) */
  carbon_per_kwh_gco2e: 340,

  model_label: 'GPT-5',
  uncertainty_range_pct: 50,

  sources: {
    energy: ['Epoch AI, "How much energy does ChatGPT use?" (2025)', 'Tom\'s Hardware, GPT-5 power consumption estimates (2025)'],
    pue: 'Industry avg 1.1–1.5; OpenAI uses similar hyperscaler PUE',
    water: ['EESI 2024, direct cooling: 1,900 L/MWh', '2024 United States Data Center Energy Usage Report'],
    carbon: ['EPA eGRID 2023, US national average', '2024 United States Data Center Energy Usage Report'],
  },
};
