import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import UsageChart from '../components/UsageChart';
import { formatNumber } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';
import { Zap, Droplets, Cloud, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(target * ease);
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function AnimatedNum({ value, decimals }) {
  const animated = useCountUp(value);
  return <>{formatNumber(animated, decimals)}</>;
}

function ImpactPanel({ cls, icon: Icon, label, value, decimals, unit, equivs }) {
  return (
    <div className={`impact-panel ${cls}`}>
      <div className="impact-panel-label">
        <Icon size={12} />
        {label}
      </div>
      <div>
        <span className="impact-big-num">
          <AnimatedNum value={value} decimals={decimals} />
        </span>
        <span className="impact-unit">{unit}</span>
      </div>
      <div className="impact-equiv">
        {equivs.map((eq, i) => (
          <div key={i} className="impact-equiv-row">
            <span className="impact-equiv-emoji">{eq.emoji}</span>
            <span className="impact-equiv-text">{eq.description.replace('Equivalent to ', '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectionSlider({ energyPerConvo, waterPerConvo, carbonPerConvo }) {
  const [dailyConvos, setDailyConvos] = useState(5);
  const annualConvos = dailyConvos * 365;
  const annualEnergy = energyPerConvo * annualConvos;
  const annualWater  = waterPerConvo  * annualConvos;
  const annualCarbon = carbonPerConvo * annualConvos;

  return (
    <div className="projection-section">
      <div className="projection-header">
        <div className="projection-title-row">
          <TrendingUp size={14} className="projection-icon" />
          <h2 className="projection-title">Annual Impact Projection</h2>
        </div>
        <p className="projection-sub">Drag to model your yearly footprint at different usage levels</p>
      </div>

      <div className="projection-slider-row">
        <span className="projection-slider-label">
          <span className="projection-slider-val">{dailyConvos}</span> conversations/day
        </span>
        <input
          type="range"
          min={1}
          max={50}
          value={dailyConvos}
          onChange={e => setDailyConvos(Number(e.target.value))}
          className="projection-range"
          aria-label="Daily conversations"
        />
        <span className="projection-slider-right">{annualConvos.toLocaleString()}/yr</span>
      </div>

      <div className="projection-results">
        <div className="projection-result projection-result--energy">
          <span className="projection-result-num">{formatNumber(annualEnergy, 4)}</span>
          <span className="projection-result-unit">kWh</span>
          <span className="projection-result-label">energy</span>
        </div>
        <div className="projection-result projection-result--water">
          <span className="projection-result-num">{formatNumber(annualWater, 2)}</span>
          <span className="projection-result-unit">L</span>
          <span className="projection-result-label">water</span>
        </div>
        <div className="projection-result projection-result--carbon">
          <span className="projection-result-num">{formatNumber(annualCarbon, 2)}</span>
          <span className="projection-result-unit">g CO₂</span>
          <span className="projection-result-label">carbon</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { hasData, totals, monthlyData } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-8">
        <h2 className="text-2xl font-black text-navy mb-4">No data yet</h2>
        <p className="text-slate font-bold mb-6">Upload your conversations.json to see your impact.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-navy text-white font-black text-sm uppercase tracking-wider border-4 border-navy hover:bg-black transition-colors"
        >
          Upload Data
        </button>
      </div>
    );
  }

  const comparisons = getComparisons(totals);
  const energyPerConvo = totals.energyKwh / totals.totalConversations;
  const waterPerConvo  = totals.waterLiters / totals.totalConversations;
  const carbonPerConvo = totals.carbonGrams / totals.totalConversations;

  return (
    <div className="animate-fade-in-up">

      {/* ── Dark block: header + 3 panels ─── */}
      <div className="dash-dark-block">
        <div className="impact-header">
          <div className="impact-header-badge">
            <AlertTriangle size={10} />
            Impact Report
          </div>
          <div>
            <h1 className="impact-header-title">Your AI Environmental Footprint</h1>
            <p className="impact-header-sub">
              {formatNumber(totals.totalConversations)} conversations &middot; {formatNumber(totals.totalTokens)} tokens analyzed
            </p>
          </div>
        </div>

        <div className="impact-panels">
          <ImpactPanel
            cls="impact-panel--energy"
            icon={Zap}
            label="Energy Consumed"
            value={totals.energyKwh}
            decimals={4}
            unit="kWh"
            equivs={[comparisons.badges[0], comparisons.badges[1]]}
          />
          <ImpactPanel
            cls="impact-panel--water"
            icon={Droplets}
            label="Water Usage"
            value={totals.waterLiters}
            decimals={2}
            unit="liters"
            equivs={[comparisons.badges[2], comparisons.badges[3]]}
          />
          <ImpactPanel
            cls="impact-panel--carbon"
            icon={Cloud}
            label="Carbon Footprint"
            value={totals.carbonGrams}
            decimals={2}
            unit="g CO₂"
            equivs={[comparisons.badges[4], comparisons.badges[5]]}
          />
        </div>
      </div>

      {/* ── Per-conversation cost ─── */}
      <div className="per-convo-section">
        <h2>Average Cost Per Conversation</h2>
        <div className="per-convo-grid">
          <div className="per-convo-item">
            <span className="per-convo-val" style={{ color: '#FAC206' }}>
              {formatNumber(energyPerConvo, 5)}
            </span>
            <span className="per-convo-label">kWh</span>
          </div>
          <div className="per-convo-item">
            <span className="per-convo-val" style={{ color: '#16C0FF' }}>
              {formatNumber(waterPerConvo, 3)}
            </span>
            <span className="per-convo-label">liters</span>
          </div>
          <div className="per-convo-item">
            <span className="per-convo-val" style={{ color: '#FB4B5F' }}>
              {formatNumber(carbonPerConvo, 3)}
            </span>
            <span className="per-convo-label">g CO₂</span>
          </div>
        </div>
      </div>

      {/* ── Projection slider ─── */}
      <ProjectionSlider
        energyPerConvo={energyPerConvo}
        waterPerConvo={waterPerConvo}
        carbonPerConvo={carbonPerConvo}
      />

      {/* ── Monthly chart ─── */}
      {monthlyData.length > 1 && (
        <div className="monthly-section">
          <h2>Monthly Usage</h2>
          <UsageChart data={monthlyData} />
        </div>
      )}

      {/* ── CTA ─── */}
      <div className="dash-cta">
        <div>
          <p className="dash-cta-text">Ready to reduce your footprint?</p>
          <p className="dash-cta-sub">See personalized tips and sustainable AI alternatives.</p>
        </div>
        <button onClick={() => navigate('/insights')} className="dash-cta-btn">
          View Insights <ArrowRight size={14} />
        </button>
      </div>

      {/* ── Disclaimer ─── */}
      <div className="px-6 py-3 border-t border-slate/10 bg-white/60">
        <p className="text-xs text-slate font-bold">
          These are estimates based on publicly available data.{' '}
          <button onClick={() => navigate('/methodology')} className="text-green underline font-black">
            See our methodology →
          </button>
        </p>
      </div>

    </div>
  );
}
