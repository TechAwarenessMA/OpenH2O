import { COEFFICIENTS } from '../data/coefficients';
import { GPT_COEFFICIENTS } from '../data/gptCoefficients';
import { BookOpen, AlertTriangle } from 'lucide-react';

/** Render a source value — handles both strings and arrays */
function Source({ value }) {
  if (Array.isArray(value)) {
    return value.map((s, i) => (
      <span key={i}>
        {i > 0 && '; '}
        {s}
      </span>
    ));
  }
  return <>{value}</>;
}

/** Reusable coefficients table */
function CoefficientsTable({ label, coeff, accentColor }) {
  return (
    <div>
      <p className="text-sm font-black text-navy mb-3 flex items-center gap-2">
        <span className="inline-block w-3 h-3 border-2 border-navy" style={{ background: accentColor }} />
        {label}
        <span className="text-xs font-bold text-slate">(v{coeff.version})</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-4 border-navy">
              <th className="text-left py-3 px-2 font-black text-navy uppercase tracking-wider text-xs">Parameter</th>
              <th className="text-left py-3 px-2 font-black text-navy uppercase tracking-wider text-xs">Value</th>
              <th className="text-left py-3 px-2 font-black text-navy uppercase tracking-wider text-xs">Source</th>
            </tr>
          </thead>
          <tbody>
            {[
              { param: 'Energy per input token', value: `${coeff.energy_per_input_token_wh} Wh`, source: coeff.sources.energy },
              { param: 'Energy per output token', value: `${coeff.energy_per_output_token_wh} Wh`, source: coeff.sources.energy },
              { param: 'PUE (Power Usage Effectiveness)', value: coeff.pue_multiplier, source: coeff.sources.pue },
              { param: 'Direct water per kWh', value: `${coeff.direct_water_per_kwh_liters} L`, source: coeff.sources.water },
              { param: 'Indirect water per kWh', value: `${coeff.indirect_water_per_kwh_liters} L`, source: coeff.sources.water },
              { param: 'Carbon per kWh', value: `${coeff.carbon_per_kwh_gco2e} g CO₂e`, source: coeff.sources.carbon },
            ].map(({ param, value, source }) => (
              <tr key={param} className="border-b-2 border-navy/10">
                <td className="py-3 px-2 font-bold text-ink">{param}</td>
                <td className="py-3 px-2 font-black text-navy">{value}</td>
                <td className="py-3 px-2 text-xs text-slate font-bold"><Source value={source} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Methodology() {
  const totalWater = COEFFICIENTS.direct_water_per_kwh_liters + COEFFICIENTS.indirect_water_per_kwh_liters;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight uppercase">Methodology</h1>
        <p className="text-slate font-bold mt-1">How we calculate your AI environmental impact</p>
        <p className="text-xs font-bold text-slate/60 mt-2">
          Claude coefficients v{COEFFICIENTS.version} · GPT coefficients v{GPT_COEFFICIENTS.version} · Last updated {COEFFICIENTS.lastUpdated}
        </p>
      </div>

      {/* Disclaimer */}
      <div
        className="border-4 border-sunshine bg-sunshine/10 p-5 flex items-start gap-3"
        style={{ boxShadow: '4px 4px 0px 0px #FAC206' }}
      >
        <AlertTriangle size={24} className="text-sunshine flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-sm text-navy mb-1">Important Disclaimer</p>
          <p className="text-xs text-ink font-bold leading-relaxed">
            These calculations are estimates (±{COEFFICIENTS.uncertainty_range_pct}%) based on publicly available
            research and industry averages. Actual environmental impact varies based on data center location,
            energy grid composition, hardware efficiency, and model architecture.
            We aim for reasonable approximations, not precise measurements.
          </p>
        </div>
      </div>

      {/* Multi-model note */}
      <div
        className="border-4 border-sky bg-sky/10 p-5"
        style={{ boxShadow: '4px 4px 0px 0px #16C0FF' }}
      >
        <p className="font-black text-sm text-navy mb-1">Multi-Provider Support</p>
        <p className="text-xs text-ink font-bold leading-relaxed">
          OpenH2O supports both Claude and ChatGPT conversation exports. Each provider uses model-specific
          energy coefficients — GPT-5 consumes significantly more energy per token than Claude Sonnet 4.6 due to
          its larger model size. Infrastructure values (PUE, water, carbon grid intensity) are shared since they
          depend on data center, not model architecture.
        </p>
      </div>

      {/* Formula walkthrough */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green flex items-center justify-center border-2 border-navy">
            <BookOpen size={18} className="text-navy" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">Calculation Pipeline</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Token Counting',
              desc: 'Messages are tokenized using a GPT-4 compatible BPE tokenizer (gpt-tokenizer). Human/user messages count as input tokens; assistant messages count as output tokens. All messages per role are joined, then tokenized once per conversation.',
              formula: 'inputTokens = encode(humanMessages.join(" ")).length\noutputTokens = encode(assistantMessages.join(" ")).length',
            },
            {
              step: '2',
              title: 'Raw Energy (Wh)',
              desc: `Energy per token depends on the model. Claude: input=${COEFFICIENTS.energy_per_input_token_wh} Wh, output=${COEFFICIENTS.energy_per_output_token_wh} Wh. GPT-5: input=${GPT_COEFFICIENTS.energy_per_input_token_wh} Wh, output=${GPT_COEFFICIENTS.energy_per_output_token_wh} Wh.`,
              formula: `rawEnergy_wh = (inputTokens × energy_per_input)\n             + (outputTokens × energy_per_output)`,
            },
            {
              step: '3',
              title: 'Total Energy (kWh)',
              desc: `A Power Usage Effectiveness (PUE) multiplier of ${COEFFICIENTS.pue_multiplier} accounts for data center cooling, lighting, and networking overhead. The result is converted from Wh to kWh.`,
              formula: `totalEnergy_wh = rawEnergy_wh × ${COEFFICIENTS.pue_multiplier}\ntotalEnergy_kwh = totalEnergy_wh / 1000`,
            },
            {
              step: '4',
              title: 'Water & Carbon',
              desc: `Water usage combines direct cooling (${COEFFICIENTS.direct_water_per_kwh_liters} L/kWh) and indirect water from electricity generation (${COEFFICIENTS.indirect_water_per_kwh_liters} L/kWh) = ${totalWater} L/kWh total. Carbon uses US average grid intensity of ${COEFFICIENTS.carbon_per_kwh_gco2e} g CO₂e/kWh.`,
              formula: `water_liters = totalEnergy_kwh × ${totalWater}\ncarbon_gco2e = totalEnergy_kwh × ${COEFFICIENTS.carbon_per_kwh_gco2e}`,
            },
          ].map(({ step, title, desc, formula }) => (
            <div key={step} className="flex items-start gap-4 p-4 bg-cream border-2 border-navy/10">
              <div className="w-8 h-8 bg-navy text-white flex items-center justify-center font-black flex-shrink-0">
                {step}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm text-navy">{title}</p>
                <p className="text-xs text-slate font-bold leading-relaxed mt-1">{desc}</p>
                {formula && (
                  <pre className="text-xs font-mono bg-navy/5 text-navy p-3 mt-2 overflow-x-auto whitespace-pre leading-relaxed">
                    {formula}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coefficients tables — Claude + GPT */}
      <div
        className="border-4 border-navy bg-white p-6 space-y-8"
        style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
      >
        <h2 className="text-lg font-black text-navy uppercase tracking-wider">Coefficients Used</h2>
        <CoefficientsTable label="Claude Sonnet 4.6" coeff={COEFFICIENTS} accentColor="#d97706" />
        <CoefficientsTable label="GPT-5" coeff={GPT_COEFFICIENTS} accentColor="#10a37f" />
      </div>

      {/* Real-world comparisons table */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
      >
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">Real-World Comparisons</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-4 border-navy">
                <th className="text-left py-3 px-2 font-black text-navy uppercase tracking-wider text-xs">Metric</th>
                <th className="text-left py-3 px-2 font-black text-navy uppercase tracking-wider text-xs">Comparison</th>
                <th className="text-left py-3 px-2 font-black text-navy uppercase tracking-wider text-xs">Formula</th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Carbon (g CO₂e)', comp: 'Miles driven (gas car)', formula: '÷ 404 g CO₂e/mile (EPA 2023)' },
                { metric: 'Carbon (g CO₂e)', comp: 'Smartphone charges', formula: '÷ 8.22 g CO₂e/charge' },
                { metric: 'Water (liters)', comp: 'Water bottles (500 mL)', formula: '÷ 0.5' },
                { metric: 'Water (liters)', comp: 'Minutes of shower', formula: '÷ 8 liters/min' },
                { metric: 'Energy (kWh)', comp: 'LED bulb hours', formula: '÷ 0.01 kWh/hr (10W LED)' },
                { metric: 'Energy (kWh)', comp: 'Laptop hours', formula: '÷ 0.05 kWh/hr' },
              ].map(({ metric, comp, formula }, i) => (
                <tr key={i} className="border-b-2 border-navy/10">
                  <td className="py-3 px-2 font-bold text-ink">{metric}</td>
                  <td className="py-3 px-2 font-black text-navy">{comp}</td>
                  <td className="py-3 px-2 text-xs text-slate font-bold font-mono">{formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uncertainty */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
      >
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">Sources of Uncertainty</h2>
        <ul className="space-y-2 text-sm text-ink font-bold">
          {[
            'Token count is approximate — we use a GPT-4 compatible tokenizer (within ~5%), but Claude and GPT-5 use their own proprietary tokenizers.',
            'Energy per token varies significantly by model size, hardware generation, and batch utilization.',
            `PUE varies by data center — hyperscalers report ~1.1–1.2, industry average is ~1.5. We use ${COEFFICIENTS.pue_multiplier}.`,
            `Grid carbon intensity varies dramatically by region (50–900+ g CO₂/kWh). We use ${COEFFICIENTS.carbon_per_kwh_gco2e} g (US average).`,
            'Water usage depends on cooling method (evaporative vs. air-cooled) and local climate conditions.',
            'We do not account for embodied carbon in hardware manufacturing or model training energy.',
            `GPT-5 energy estimates are based on early research (Epoch AI, U. of Rhode Island) and may be revised as more data becomes available.`,
            `All estimates carry ±${COEFFICIENTS.uncertainty_range_pct}% uncertainty.`,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-coral font-black mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* References */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
      >
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">References</h2>
        <ul className="space-y-2 text-sm font-bold">
          {[
            { text: 'Luccioni et al. — Power Hungry Processing (2023)', url: 'https://arxiv.org/abs/2311.16863' },
            { text: '2024 United States Data Center Energy Usage Report', url: 'https://eta.lbl.gov/publications/2024-united-states-data-center' },
            { text: 'EESI — Data Center Water Usage (2024)', url: 'https://www.eesi.org/papers/view/fact-sheet-the-energy-and-water-impacts-of-data-centers' },
            { text: 'US EPA — eGRID (Grid Carbon Intensity)', url: 'https://www.epa.gov/egrid' },
            { text: 'Uptime Institute — Global PUE Survey', url: 'https://uptimeinstitute.com/resources/research-and-reports/uptime-institute-global-data-center-survey-results-2023' },
            { text: 'IEA — Data Centres and Data Transmission Networks', url: 'https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks' },
            { text: 'Epoch AI — How much energy does ChatGPT use? (2025)', url: 'https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use' },
            { text: "Tom's Hardware — GPT-5 Power Consumption Estimates (2025)", url: 'https://www.tomshardware.com/tech-industry/artificial-intelligence/chatgpt-5-power-consumption-could-be-as-much-as-eight-times-higher-than-gpt-4-research-institute-estimates-medium-sized-gpt-5-response-can-consume-up-to-40-watt-hours-of-electricity' },
          ].map(({ text, url }) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-green hover:text-navy underline transition-colors">
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
