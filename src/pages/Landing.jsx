import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import UploadZone from '../components/UploadZone';
import { Zap, Droplets, Cloud } from 'lucide-react';

export default function Landing() {
  const { uploadFile, hasData } = useEcoData();
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    await uploadFile(file);
    navigate('/processing');
  };

  return (
    <div className="animate-fade-in-up">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-0 mb-10 border-4 border-navy overflow-hidden">
        {/* Left — navy panel */}
        <div className="bg-navy text-white p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Know your AI<br />footprint.
          </h1>
          <p className="text-white/70 text-lg font-bold leading-relaxed">
            Upload your Claude conversations export and see the energy, water, and carbon impact of your AI usage.
          </p>
        </div>

        {/* Right — cream panel */}
        <div className="bg-cream p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
          <div className="space-y-4">
            {[
              { step: '1', text: 'Export your data from claude.ai (Settings → Export)' },
              { step: '2', text: 'Upload your conversations.json file below' },
              { step: '3', text: 'See your environmental impact instantly' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-navy text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                  {step}
                </div>
                <p className="text-ink font-bold text-sm leading-snug pt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <UploadZone onUpload={handleUpload} />

      {/* Metric preview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        {[
          { icon: Zap, label: 'Energy (kWh)', color: 'bg-sunshine', desc: 'Electricity consumed by data centers' },
          { icon: Droplets, label: 'Water (L)', color: 'bg-sky', desc: 'Cooling water for server hardware' },
          { icon: Cloud, label: 'Carbon (g CO₂)', color: 'bg-green', desc: 'Greenhouse gas emissions produced' },
        ].map(({ icon: Icon, label, color, desc }) => (
          <div key={label} className="border-4 border-navy p-5 bg-white animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 ${color} flex items-center justify-center`}>
                <Icon size={18} className="text-navy" />
              </div>
              <span className="font-black text-sm uppercase tracking-wider text-navy">{label}</span>
            </div>
            <p className="text-slate text-xs font-bold">{desc}</p>
          </div>
        ))}
      </div>

      {/* Privacy notice */}
      <div className="mt-8 p-4 border-2 border-slate/30 bg-white/50">
        <p className="text-xs text-slate font-bold leading-relaxed">
          <span className="text-navy font-black uppercase tracking-wider">Privacy:</span>{' '}
          Your data never leaves your browser. All processing happens locally — nothing is sent to any server.
          We don't store, transmit, or read your conversations.
        </p>
      </div>

      {hasData && (
        <div className="mt-6 p-4 border-4 border-green bg-green/10">
          <p className="font-black text-sm text-navy">
            You already have data loaded.{' '}
            <button onClick={() => navigate('/dashboard')} className="text-green underline">
              View your dashboard →
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
