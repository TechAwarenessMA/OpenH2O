import { COEFFICIENTS } from '../data/coefficients';
import { BookOpen, AlertTriangle } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight">Methodology</h1>
        <p className="text-slate font-bold mt-1">How we calculate your AI environmental impact</p>
      </div>

      {/* Disclaimer */}
      <div className="border-4 border-sunshine bg-sunshine/10 p-5 flex items-start gap-3">
        <AlertTriangle size={24} className="text-sunshine flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-sm text-navy mb-1">Important Disclaimer</p>
          <p className="text-xs text-ink font-bold leading-relaxed">
            These calculations are estimates based on publicly available research and industry averages.
            Actual environmental impact varies based on data center location, energy grid composition,
            hardware efficiency, and model architecture. We aim for reasonable approximations, not precise measurements.
          </p>
        </div>
      </div>

      {/* Formula walkthrough */}
      <div className="border-4 border-navy bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green flex items-center justify-center">
            <BookOpen size={18} className="text-navy" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">Calculation Pipeline</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Token Counting',
              desc: 'We tokenize each message using a GPT-compatible tokenizer to estimate token count. This approximates the actual tokens processed by the model.',
            },
            {
              step: '2',
              title: 'Energy Estimation',
              desc: `Each token requires approximately ${COEFFICIENTS.ENERGY_PER_TOKEN_KWH} kWh of energy for inference. This is multiplied by the Power Usage Effectiveness (PUE) of ${COEFFICIENTS.PUE} to account for data center cooling and overhead.`,
            },
            {
              step: '3',
              title: 'Water Calculation',
              desc: `Data centers use approximately ${COEFFICIENTS.WATER_PER_KWH_LITERS} liters of water per kWh for cooling. We multiply the total energy by this coefficient.`,
            },
            {
              step: '4',
              title: 'Carbon Emissions',
              desc: `Using an average grid carbon intensity of ${COEFFICIENTS.CARBON_PER_KWH_GRAMS} g CO₂/kWh (US average), we convert energy to carbon emissions.`,
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 p-4 bg-cream border-2 border-navy/10">
              <div className="w-8 h-8 bg-navy text-white flex items-center justify-center font-black flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="font-black text-sm text-navy">{title}</p>
                <p className="text-xs text-slate font-bold leading-relaxed mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coefficients table */}
      <div className="border-4 border-navy bg-white p-6">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">Coefficients Used</h2>
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
                { param: 'Energy per token', value: `${COEFFICIENTS.ENERGY_PER_TOKEN_KWH} kWh`, source: COEFFICIENTS.SOURCES.ENERGY },
                { param: 'PUE (Power Usage Effectiveness)', value: COEFFICIENTS.PUE, source: COEFFICIENTS.SOURCES.PUE },
                { param: 'Water per kWh', value: `${COEFFICIENTS.WATER_PER_KWH_LITERS} L`, source: COEFFICIENTS.SOURCES.WATER },
                { param: 'Carbon per kWh', value: `${COEFFICIENTS.CARBON_PER_KWH_GRAMS} g CO₂`, source: COEFFICIENTS.SOURCES.CARBON },
              ].map(({ param, value, source }) => (
                <tr key={param} className="border-b-2 border-navy/10">
                  <td className="py-3 px-2 font-bold text-ink">{param}</td>
                  <td className="py-3 px-2 font-black text-navy">{value}</td>
                  <td className="py-3 px-2 text-xs text-slate font-bold">{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uncertainty */}
      <div className="border-4 border-navy bg-white p-6">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">Sources of Uncertainty</h2>
        <ul className="space-y-2 text-sm text-ink font-bold">
          {[
            'Token count is approximate — we use a GPT-compatible tokenizer, but Claude uses its own tokenizer.',
            'Energy per token varies significantly by model size and hardware generation.',
            'PUE varies by data center — Google reports ~1.1, industry average is ~1.58.',
            'Grid carbon intensity varies dramatically by region (50-900+ g CO₂/kWh).',
            'Water usage depends on cooling method and local climate.',
            'We don\'t account for embodied carbon in hardware manufacturing.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-coral font-black">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* References */}
      <div className="border-4 border-navy bg-white p-6">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">References</h2>
        <ul className="space-y-2 text-sm font-bold">
          {[
            { text: 'IEA — Data Centres and Data Transmission Networks', url: 'https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks' },
            { text: 'Uptime Institute — Global PUE Survey', url: 'https://uptimeinstitute.com/resources/research-and-reports/uptime-institute-global-data-center-survey-results-2023' },
            { text: 'US EPA — eGRID (Grid Carbon Intensity)', url: 'https://www.epa.gov/egrid' },
            { text: 'Google Environmental Report 2024', url: 'https://sustainability.google/reports/google-2024-environmental-report/' },
            { text: 'Luccioni et al. — Power Hungry Processing (2023)', url: 'https://arxiv.org/abs/2311.16863' },
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
