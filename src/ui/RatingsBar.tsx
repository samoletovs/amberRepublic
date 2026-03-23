import type { InternationalRatings } from '../engine/politics';

interface Props {
  ratings: InternationalRatings;
}

export default function RatingsBar({ ratings }: Props) {
  const ratingColor = (r: string) => {
    if (r.startsWith('A')) return '#16A34A';
    if (r.startsWith('BBB')) return '#B8860B';
    return '#DC2626';
  };

  return (
    <div className="glass-card p-4 mb-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039', fontFamily: 'Source Sans 3' }}>
        🏛️ International Ratings
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#78716C' }}>S&P:</span>
          <span className="font-data font-semibold" style={{ color: ratingColor(ratings.spRating) }}>{ratings.spRating}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#78716C' }}>Moody's:</span>
          <span className="font-data font-semibold" style={{ color: ratingColor(ratings.moodysRating.startsWith('A') ? 'A' : ratings.moodysRating.startsWith('Baa') ? 'BBB' : 'BB') }}>{ratings.moodysRating}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#78716C' }}>Freedom:</span>
          <span className="font-data font-semibold" style={{ color: ratings.freedomHouse > 70 ? '#16A34A' : ratings.freedomHouse > 50 ? '#B8860B' : '#DC2626' }}>{ratings.freedomHouse}/100</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#78716C' }}>HDI:</span>
          <span className="font-data font-semibold" style={{ color: ratings.hdi > 0.85 ? '#16A34A' : '#B8860B' }}>{ratings.hdi.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#78716C' }}>CPI:</span>
          <span className="font-data" style={{ color: '#3D3731' }}>{ratings.transparencyIndex}/100</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#78716C' }}>Press:</span>
          <span className="font-data" style={{ color: '#3D3731' }}>#{ratings.pressFredomRank}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <span style={{ color: '#78716C' }}>Ease of Business:</span>
          <span className="font-data" style={{ color: '#3D3731' }}>#{ratings.doingBusinessRank}</span>
        </div>
      </div>
    </div>
  );
}
