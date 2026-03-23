export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      {/* Decorative diagonal line */}
      <div className="absolute top-0 right-0 w-px h-64 sm:h-96 opacity-10"
        style={{ background: 'linear-gradient(to bottom, #C9A227, transparent)', transform: 'rotate(15deg)', transformOrigin: 'top right' }} />

      <div className="text-center max-w-2xl w-full">
        {/* Coat of arms / amber stone */}
        <div className="fade-in mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)', border: '1px solid rgba(201,162,39,0.12)' }}>
            <span className="text-4xl sm:text-5xl">🏛️</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="fade-in stagger-1 text-5xl sm:text-7xl md:text-8xl font-bold mb-3 sm:mb-4 leading-none tracking-tight"
          style={{
            background: 'linear-gradient(160deg, #E8D5A3 0%, #C9A227 40%, #7A5C12 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          Amber<br className="sm:hidden" /> Republic
        </h1>

        <p className="fade-in stagger-2 text-lg sm:text-xl md:text-2xl mb-2 font-light tracking-widest uppercase"
          style={{ color: 'rgba(201,162,39,0.5)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.2em' }}>
          Shape Latvia's Future
        </p>

        {/* Ornamental divider */}
        <div className="fade-in stagger-2 flex items-center justify-center gap-3 my-6 sm:my-8">
          <div className="w-12 sm:w-20 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,162,39,0.3))' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A227', opacity: 0.4 }} />
          <div className="w-12 sm:w-20 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,162,39,0.3))' }} />
        </div>

        <p className="fade-in stagger-3 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed px-2"
          style={{ color: '#8a8272' }}>
          You are the leader of Latvia — a small Baltic nation of 1.86 million
          navigating between Russia's shadow, Europe's bureaucracy, and its own
          vanishing population. Every decision has consequences. Most won't be
          obvious until it's too late.
        </p>

        {/* Situation briefing */}
        <div className="fade-in stagger-3 glass-card p-5 sm:p-6 mb-8 text-left max-w-md mx-auto">
          <h3 className="text-xs font-semibold mb-4 uppercase tracking-[0.15em]"
            style={{ color: '#C9A227', fontFamily: 'DM Sans, sans-serif' }}>
            Intelligence Briefing — Q1 2025
          </h3>
          <div className="space-y-2.5 text-sm" style={{ color: '#9a9385' }}>
            {[
              ['🇱🇻', 'Population', '1.86M — falling fast'],
              ['💰', 'GDP', '€45B — growing, but slowly'],
              ['✈️', 'Brain drain', '20,000 leave each year'],
              ['🇷🇺', 'Russia', 'Relations near-frozen since 2022'],
              ['🏥', 'Healthcare', 'Worst-ranked in the EU'],
              ['🎵', 'Song Festival', 'The soul lives on'],
            ].map(([emoji, label, val]) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-base">{emoji}</span>
                <span className="font-medium" style={{ color: '#c4baa3' }}>{label}:</span>
                <span className="flex-1 text-xs">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="fade-in stagger-3">
          <button
            onClick={onStart}
            className="group w-full sm:w-auto px-10 py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 pulse-amber relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #C9A227, #7A5C12)',
              color: '#0B0F1A',
            }}
          >
            <span className="relative z-10">Begin Your Decade in Power</span>
            <div className="absolute inset-0 shimmer" />
          </button>
        </div>

        <p className="text-xs mt-6" style={{ color: '#5a554a' }}>
          Each turn = 1 quarter · You have 10 years · Choose wisely
        </p>

        <div className="mt-10 text-[11px] tracking-wide" style={{ color: '#3d3a34' }}>
          Inspired by Tropico · Built with real Latvia data · Every decision teaches something
        </div>
      </div>
    </div>
  );
}
