/**
 * Environmental impact coefficients for AI inference calculations.
 *
 * These are estimates based on publicly available research.
 * Actual values vary by data center, hardware, model, and region.
 */
export const COEFFICIENTS = {
  /**
   * Energy consumed per token during inference (kWh).
   * Based on estimates for large language models (~100B+ params).
   * Source: Luccioni et al. 2023, IEA data center reports.
   * Range in literature: 0.001-0.01 Wh/token → we use ~0.003 Wh = 0.000003 kWh
   */
  ENERGY_PER_TOKEN_KWH: 0.000003,

  /**
   * Power Usage Effectiveness — ratio of total data center energy
   * to energy used by computing equipment.
   * 1.0 = perfect efficiency, industry average ~1.58, hyperscalers ~1.1-1.2.
   * Source: Uptime Institute Global PUE Survey 2023.
   */
  PUE: 1.2,

  /**
   * Liters of water consumed per kWh of data center energy.
   * Includes cooling tower evaporation and indirect water use.
   * Source: Google Environmental Report 2024, Shehabi et al.
   */
  WATER_PER_KWH_LITERS: 1.8,

  /**
   * Grams of CO₂ emitted per kWh of electricity.
   * US national average grid carbon intensity.
   * Source: EPA eGRID 2022.
   * Note: varies dramatically by region (50-900+ g/kWh).
   */
  CARBON_PER_KWH_GRAMS: 390,

  /** Source citations for each coefficient */
  SOURCES: {
    ENERGY: 'Luccioni et al. 2023; IEA Data Centre Reports',
    PUE: 'Uptime Institute Global PUE Survey 2023',
    WATER: 'Google Environmental Report 2024',
    CARBON: 'EPA eGRID 2022 (US national average)',
  },

  /** Version tag for tracking coefficient updates */
  VERSION: '1.0.0',
};
