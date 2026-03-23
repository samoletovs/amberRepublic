export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-3xl fade-in">
        {/* Amber stone decoration */}
        <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🏛️</div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-3 sm:mb-4" style={{
          background: 'linear-gradient(135deg, #D4A843, #F5E6C8, #D4A843)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
        }}>
          Amber Republic
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-2 font-light tracking-wide">
          Shape Latvia's Future
        </p>
        
        <div className="w-24 h-0.5 bg-amber-gold/40 mx-auto my-6" />
        
        <p className="text-base text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
          You are the leader of Latvia — a small Baltic nation of 1.86 million people 
          navigating between Russia's shadow, Europe's bureaucracy, and its own 
          disappearing population. Every decision has consequences. Most of them 
          won't be obvious until it's too late.
        </p>

        <div className="glass-card p-6 mb-8 text-left max-w-lg mx-auto">
          <h3 className="text-amber-gold font-semibold mb-3 text-sm uppercase tracking-wider">The Situation — Q1 2025</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>🇱🇻 <span className="text-slate-200">Population:</span> 1.86M and falling fast</li>
            <li>💰 <span className="text-slate-200">GDP:</span> €45B — growing, but slowly</li>
            <li>✈️ <span className="text-slate-200">Brain drain:</span> 20,000 leave each year</li>
            <li>🇷🇺 <span className="text-slate-200">Russia:</span> Relations near-frozen since 2022</li>
            <li>🏥 <span className="text-slate-200">Healthcare:</span> Worst-ranked in the EU</li>
            <li>🎵 <span className="text-slate-200">Song Festival:</span> The soul lives on</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 pulse-amber"
          style={{
            background: 'linear-gradient(135deg, #D4A843, #8B6914)',
            color: '#0f172a',
          }}
        >
          Begin Your Decade in Power
        </button>

        <p className="text-xs text-slate-500 mt-6">
          Each turn = 1 quarter. You have 10 years. Choose wisely.
        </p>

        <div className="mt-10 text-xs text-slate-600">
          Inspired by Tropico • Built with real Latvia data • Every decision teaches something
        </div>
      </div>
    </div>
  );
}
