import { ExternalLink, Github, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight">About OpenH2O</h1>
        <p className="text-slate font-bold mt-1">Understanding your AI environmental footprint</p>
      </div>

      {/* Mission */}
      <div className="border-4 border-navy bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-coral flex items-center justify-center">
            <Heart size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">Our Mission</h2>
        </div>
        <div className="space-y-3 text-sm text-ink font-bold leading-relaxed">
          <p>
            OpenH2O is built by the <strong>Tech Awareness Association</strong> (TAA), a student-founded nonprofit
            dedicated to promoting technology literacy and digital responsibility.
          </p>
          <p>
            As AI becomes an everyday tool, understanding its environmental cost is crucial. OpenH2O makes
            this invisible impact visible — empowering users to make more informed choices about their AI usage.
          </p>
        </div>
      </div>

      {/* What this tool does */}
      <div className="border-4 border-navy bg-white p-6">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">What OpenH2O Does</h2>
        <ul className="space-y-3 text-sm text-ink font-bold">
          {[
            'Estimates the energy, water, and carbon footprint of your Claude and ChatGPT conversations',
            'Processes everything locally in your browser — your data never leaves your device',
            'Provides real-world comparisons to contextualize your impact',
            'Offers actionable tips for reducing your AI environmental footprint',
            'Explains the methodology transparently with full source citations',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-black text-xs">✓</span>
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Privacy */}
      <div className="border-4 border-green bg-green/5 p-6">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">Privacy First</h2>
        <div className="space-y-2 text-sm text-ink font-bold leading-relaxed">
          <p>OpenH2O is a fully client-side application. This means:</p>
          <ul className="space-y-1 ml-4">
            <li>• No data is sent to any server</li>
            <li>• No cookies or tracking</li>
            <li>• No accounts required</li>
            <li>• Your conversations stay on your device</li>
            <li>• Closing the tab erases all processed data</li>
          </ul>
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://www.techawarenessma.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border-4 border-navy bg-white p-5 flex items-center gap-3 hover:bg-navy hover:text-white transition-colors group"
        >
          <ExternalLink size={20} className="text-green group-hover:text-sunshine" />
          <div>
            <p className="font-black text-sm uppercase tracking-wider">TAA Website</p>
            <p className="text-xs text-slate group-hover:text-white/70 font-bold">techawarenessma.com</p>
          </div>
        </a>
        <a
          href="https://github.com/Tech-Awareness-Association/OpenH2O"
          target="_blank"
          rel="noopener noreferrer"
          className="border-4 border-navy bg-white p-5 flex items-center gap-3 hover:bg-navy hover:text-white transition-colors group"
        >
          <Github size={20} className="text-green group-hover:text-sunshine" />
          <div>
            <p className="font-black text-sm uppercase tracking-wider">GitHub</p>
            <p className="text-xs text-slate group-hover:text-white/70 font-bold">View source code</p>
          </div>
        </a>
      </div>

      {/* TAA credit */}
      <div className="p-5 border-4 border-navy bg-navy text-white text-center">
        <p className="font-black text-sm uppercase tracking-wider mb-1">
          A free tool by Tech Awareness Association
        </p>
        <p className="text-xs text-white/60 font-bold">
          Student-founded nonprofit · Shrewsbury, MA
        </p>
      </div>
    </div>
  );
}
