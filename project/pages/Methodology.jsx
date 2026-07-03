import { C, F, sectionNarrow } from '../theme';

const PIPELINE = [
  {
    n: '01', title: 'Token counting',
    body: 'Messages are tokenized using a GPT-4 compatible BPE tokenizer (gpt-tokenizer). Human/user messages count as input tokens; assistant messages count as output tokens. All messages per role are joined, then tokenized once per conversation.',
    code: 'inputTokens = encode(humanMessages.join(" ")).length\noutputTokens = encode(assistantMessages.join(" ")).length',
  },
  {
    n: '02', title: 'Raw energy (Wh)',
    body: 'Energy per token depends on the model. Claude: input=0.0000039 Wh, output=0.000195 Wh. GPT-5: input=0.00008 Wh, output=0.004 Wh.',
    code: 'rawEnergy_wh = (inputTokens × energy_per_input)\n             + (outputTokens × energy_per_output)',
  },
  {
    n: '03', title: 'Total energy (kWh)',
    body: 'A Power Usage Effectiveness (PUE) multiplier of 1.2 accounts for data center cooling, lighting, and networking overhead. The result is converted from Wh to kWh.',
    code: 'totalEnergy_wh = rawEnergy_wh × 1.2\ntotalEnergy_kwh = totalEnergy_wh / 1000',
  },
  {
    n: '04', title: 'Water & carbon',
    body: 'Water usage combines direct cooling (1.9 L/kWh) and indirect water from electricity generation (4.5 L/kWh) = 6.4 L/kWh total. Carbon uses US average grid intensity of 340 g CO₂e/kWh.',
    code: 'water_liters = totalEnergy_kwh × 6.4\ncarbon_gco2e = totalEnergy_kwh × 340',
  },
];

const CLAUDE_COEFFS = [
  ['Energy per input token', '0.0000039 Wh', 'Luccioni et al. 2023; 2024 US Data Center Energy Report'],
  ['Energy per output token', '0.000195 Wh', 'Luccioni et al. 2023; 2024 US Data Center Energy Report'],
  ['PUE (Power Usage Effectiveness)', '1.2', 'Anthropic datacenter estimate; industry avg 1.1–1.5'],
  ['Direct water per kWh', '1.9 L', 'EESI 2024, direct cooling: 1,900 L/MWh'],
  ['Indirect water per kWh', '4.5 L', '2024 US Data Center Energy Usage Report'],
  ['Carbon per kWh', '340 g CO₂e', 'EPA eGRID 2023, US national average'],
];

const GPT_COEFFS = [
  ['Energy per input token', '0.00008 Wh', 'Epoch AI (2025); Tom\'s Hardware (2025)'],
  ['Energy per output token', '0.004 Wh', 'Epoch AI (2025); Tom\'s Hardware (2025)'],
  ['PUE / water / carbon', 'shared', 'Same as Claude — infrastructure-dependent, not model-dependent'],
];

const COMPARISONS = [
  ['Carbon (g CO₂e)', 'Miles driven (gas car)', '÷ 404 g CO₂e/mile (EPA 2023)'],
  ['Carbon (g CO₂e)', 'Smartphone charges', '÷ 8.22 g CO₂e/charge'],
  ['Water (liters)', 'Water bottles (500 mL)', '÷ 0.5'],
  ['Water (liters)', 'Minutes of shower', '÷ 8 liters/min'],
  ['Energy (kWh)', 'LED bulb hours', '÷ 0.01 kWh/hr (10W LED)'],
  ['Energy (kWh)', 'Laptop hours', '÷ 0.05 kWh/hr'],
];

const UNCERTAINTY = [
  'Token count is approximate — we use a GPT-4 compatible tokenizer (within ~5%), but Claude and GPT-5 use their own proprietary tokenizers.',
  'Energy per token varies significantly by model size, hardware generation, and batch utilization.',
  'PUE varies by data center — hyperscalers report ~1.1–1.2, industry average is ~1.5. We use 1.2.',
  'Grid carbon intensity varies dramatically by region (50–900+ g CO₂/kWh). We use 340 g (US average).',
  'Water usage depends on cooling method (evaporative vs. air-cooled) and local climate conditions.',
  'We do not account for embodied carbon in hardware manufacturing or model training energy.',
  'GPT-5 energy estimates are based on early research (Epoch AI, U. of Rhode Island) and may be revised as more data becomes available.',
  'All estimates carry ±50% uncertainty.',
];

const REFERENCES = [
  ['Luccioni et al. — Power Hungry Processing (2023) ↗', 'https://arxiv.org/abs/2311.16863'],
  ['2024 United States Data Center Energy Usage Report ↗', 'https://eta.lbl.gov/publications/2024-united-states-data-center'],
  ['EESI — Data Center Water Usage (2024) ↗', 'https://www.eesi.org/papers/view/fact-sheet-the-energy-and-water-impacts-of-data-centers'],
  ['US EPA — eGRID (Grid Carbon Intensity) ↗', 'https://www.epa.gov/egrid'],
  ['Uptime Institute — Global PUE Survey ↗', 'https://uptimeinstitute.com/resources/research-and-reports/uptime-institute-global-data-center-survey-results-2023'],
  ['IEA — Data Centres and Data Transmission Networks ↗', 'https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks'],
  ['Epoch AI — How much energy does ChatGPT use? (2025) ↗', 'https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use'],
  ["Tom's Hardware — GPT-5 Power Consumption Estimates (2025) ↗", 'https://www.tomshardware.com/tech-industry/artificial-intelligence/chatgpt-5-power-consumption-could-be-as-much-as-eight-times-higher-than-gpt-4-research-institute-estimates-medium-sized-gpt-5-response-can-consume-up-to-40-watt-hours-of-electricity'],
];

const H2 = { fontFamily: F.anton, fontSize: 'clamp(28px,3vw,42px)', margin: '0 0 24px', textTransform: 'uppercase' };
const TABLE_HEAD = { fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted };
const codeBlock = { fontFamily: F.mono, fontSize: '11.5px', background: C.panel, borderLeft: `2px solid ${C.ink}`, padding: '14px 16px', margin: '12px 0 0', overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre-wrap' };

function Row3({ cols, grid, head, first }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '10px', padding: head ? '10px 0' : '12px 0', borderBottom: `1px solid ${C.hairSoft}`, ...(head ? TABLE_HEAD : { fontSize: '13px' }) }}>
      {cols.map((c, i) => (
        <span key={i} style={i === 0 ? (head ? {} : { fontWeight: first === 'bold' ? 600 : 500 }) : i === 1 ? (head ? {} : { fontFamily: F.mono, fontSize: '12px' }) : (head ? {} : { fontSize: '11.5px', color: C.muted, fontFamily: i === 2 && first === 'compare' ? F.mono : undefined, fontWeight: 500 })}>{c}</span>
      ))}
    </div>
  );
}

export default function Methodology() {
  const coeffGrid = 'minmax(150px,1.3fr) minmax(90px,0.8fr) minmax(180px,1.6fr)';
  const compGrid = 'minmax(120px,1fr) minmax(150px,1.2fr) minmax(150px,1.2fr)';

  return (
    <section data-screen-label="Methodology" style={{ ...sectionNarrow, gap: 'clamp(32px,4vw,52px)' }}>
      <div>
        <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(48px,7vw,96px)', margin: 0, textTransform: 'uppercase', lineHeight: 0.95 }}>Methodology</h1>
        <p style={{ fontSize: '15px', color: C.body, margin: '14px 0 0', fontWeight: 500 }}>How we calculate your AI environmental impact</p>
        <p style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '8px 0 0', color: C.muted }}>Claude coefficients v1.1 · GPT coefficients v1.0 · Last updated March 2026</p>
      </div>

      {/* Disclaimer */}
      <div style={{ border: `2px solid ${C.ink}`, padding: '22px 24px', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: F.anton, fontSize: '34px', lineHeight: 1 }}>(!)</span>
        <div>
          <p style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>Important disclaimer</p>
          <p style={{ fontSize: '13.5px', margin: 0, color: C.body, lineHeight: 1.6, fontWeight: 500 }}>These calculations are estimates (±50%) based on publicly available research and industry averages. Actual environmental impact varies based on data center location, energy grid composition, hardware efficiency, and model architecture. We aim for reasonable approximations, not precise measurements.</p>
        </div>
      </div>

      {/* Multi-provider */}
      <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: '20px' }}>
        <p style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>Multi-provider support</p>
        <p style={{ fontSize: '13.5px', margin: 0, color: C.body, lineHeight: 1.6, fontWeight: 500, maxWidth: '760px' }}>OpenH2O supports both Claude and ChatGPT conversation exports. Each provider uses model-specific energy coefficients — GPT-5 consumes significantly more energy per token than Claude Sonnet 4.6 due to its larger model size. Infrastructure values (PUE, water, carbon grid intensity) are shared since they depend on data center, not model architecture.</p>
      </div>

      {/* Pipeline */}
      <div>
        <h2 style={H2}>Calculation pipeline</h2>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `2px solid ${C.ink}` }}>
          {PIPELINE.map((step) => (
            <div key={step.n} style={{ display: 'grid', gridTemplateColumns: 'clamp(60px,8vw,110px) minmax(0,1fr)', gap: 'clamp(14px,3vw,32px)', padding: '24px 0', borderBottom: `1px solid ${C.hairSoft}` }}>
              <span style={{ fontFamily: F.anton, fontSize: 'clamp(40px,5vw,72px)', lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `2px ${C.ink}` }}>{step.n}</span>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{step.title}</p>
                <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: C.body, lineHeight: 1.6, fontWeight: 500 }}>{step.body}</p>
                <pre style={codeBlock}>{step.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coefficients */}
      <div>
        <h2 style={H2}>Coefficients used</h2>

        <p style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 600 }}>■ Claude Sonnet 4.6 <span style={{ color: C.muted }}>(v1.1)</span></p>
        <div style={{ borderTop: `2px solid ${C.ink}`, marginBottom: '36px', overflowX: 'auto' }}>
          <Row3 cols={['Parameter', 'Value', 'Source']} grid={coeffGrid} head />
          {CLAUDE_COEFFS.map((r, i) => <Row3 key={i} cols={r} grid={coeffGrid} first="bold" />)}
        </div>

        <p style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 600 }}>□ GPT-5 <span style={{ color: C.muted }}>(v1.0)</span> <span style={{ border: `1px solid ${C.ink}`, padding: '2px 8px', marginLeft: '8px' }}>Experimental estimates</span></p>
        <div style={{ borderTop: `2px solid ${C.ink}`, overflowX: 'auto' }}>
          <Row3 cols={['Parameter', 'Value', 'Source']} grid={coeffGrid} head />
          {GPT_COEFFS.map((r, i) => <Row3 key={i} cols={r} grid={coeffGrid} first="bold" />)}
        </div>
        <p style={{ fontSize: '12px', color: C.muted, margin: '12px 0 0', lineHeight: 1.6, fontWeight: 500, maxWidth: '720px' }}>GPT-5 energy values are based on early research estimates (Epoch AI, Tom's Hardware) and carry higher uncertainty than Claude coefficients. These will be updated as more data becomes available.</p>
      </div>

      {/* Comparisons */}
      <div>
        <h2 style={H2}>Real-world comparisons</h2>
        <div style={{ borderTop: `2px solid ${C.ink}`, overflowX: 'auto' }}>
          <Row3 cols={['Metric', 'Comparison', 'Formula']} grid={compGrid} head />
          {COMPARISONS.map((r, i) => <Row3 key={i} cols={r} grid={compGrid} first="compare" />)}
        </div>
      </div>

      {/* Uncertainty */}
      <div>
        <h2 style={{ ...H2, margin: '0 0 20px' }}>Sources of uncertainty</h2>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${C.hair}` }}>
          {UNCERTAINTY.map((u, i) => (
            <p key={i} style={{ display: 'flex', gap: '14px', margin: 0, padding: '12px 0', borderBottom: `1px solid ${C.hairSoft}`, fontSize: '13.5px', lineHeight: 1.55, fontWeight: 500, color: C.body }}>
              <span style={{ fontFamily: F.mono }}>—</span><span>{u}</span>
            </p>
          ))}
        </div>
      </div>

      {/* References */}
      <div>
        <h2 style={{ ...H2, margin: '0 0 20px' }}>References</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {REFERENCES.map(([text, href], i) => (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: C.ink, textDecoration: 'underline', textUnderlineOffset: '3px' }}>{text}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
