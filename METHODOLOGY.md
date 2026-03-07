# OpenPrompt Methodology

## Overview

OpenPrompt estimates the environmental impact of AI conversations by converting token counts into energy, water, and carbon metrics. These are **estimates** — actual values depend on many factors we cannot measure directly.

## Calculation Pipeline

### 1. Token Counting

Each message in a conversation is tokenized using a GPT-compatible tokenizer (via `gpt-tokenizer`). This approximates the token count processed by the model.

**Caveat:** Claude uses its own tokenizer which may produce slightly different counts.

### 2. Energy Estimation

```
Energy (kWh) = Tokens × Energy_per_token × PUE
```

- **Energy per token**: 0.000003 kWh (~0.003 Wh)
  - Based on estimates for large language models (100B+ parameters)
  - Sources: Luccioni et al. 2023, IEA data center reports
- **PUE (Power Usage Effectiveness)**: 1.2
  - Ratio of total data center power to compute power
  - Hyperscale average; industry-wide average is ~1.58
  - Source: Uptime Institute Global PUE Survey 2023

### 3. Water Consumption

```
Water (liters) = Energy (kWh) × Water_per_kWh
```

- **Water per kWh**: 1.8 liters
  - Includes cooling tower evaporation
  - Source: Google Environmental Report 2024, Shehabi et al.

### 4. Carbon Emissions

```
Carbon (g CO₂) = Energy (kWh) × Carbon_per_kWh
```

- **Carbon per kWh**: 390 g CO₂
  - US national average grid carbon intensity
  - Source: EPA eGRID 2022
  - Note: Varies dramatically by region (50–900+ g/kWh)

## Sources of Uncertainty

- Token counts are approximate (different tokenizer than Claude's)
- Energy per token varies by model size, hardware, and batch size
- PUE varies by data center (Google reports ~1.1, some facilities exceed 2.0)
- Grid carbon intensity varies by region and time of day
- Water usage depends on cooling method and local climate
- We do not account for embodied carbon in hardware manufacturing
- Training costs are not included — only inference

## References

1. IEA — Data Centres and Data Transmission Networks
   https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks

2. Uptime Institute — Global PUE Survey
   https://uptimeinstitute.com/resources/research-and-reports/uptime-institute-global-data-center-survey-results-2023

3. US EPA — eGRID
   https://www.epa.gov/egrid

4. Google Environmental Report 2024
   https://sustainability.google/reports/google-2024-environmental-report/

5. Luccioni et al. — Power Hungry Processing (2023)
   https://arxiv.org/abs/2311.16863

## Coefficient Version

Current: 1.0.0

When updating coefficients, bump the version in `src/data/coefficients.js` and update this document.
