import type { Lot } from '../types/trade';
import { formatInr, getHighestBidAmount } from '../utils/format';

interface LiveTickerProps {
  lots: Lot[];
  onSelectLot?: (lotId: string) => void;
}

export function LiveTicker({ lots, onSelectLot }: LiveTickerProps) {
  const openLots = lots.filter((l) => l.status === 'open');
  const items = openLots.length > 0 ? openLots : lots.slice(0, 5);
  const trackItems = [...items, ...items];

  return (
    <div
      className="tf-marquee-wrap"
      aria-label="Live mandi bid and ask prices"
    >
      <div className="tf-marquee-track">
        {trackItems.map((lot, idx) => {
          const highest = getHighestBidAmount(lot);
          const diff = highest > 0 ? highest - lot.askPricePerKg : 0;
          return (
            <button
              key={`${lot.id}-${idx}`}
              type="button"
              onClick={() => onSelectLot?.(lot.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 24px',
                background: 'transparent',
                border: 'none',
                borderRight: '1px solid var(--tf-border)',
                cursor: onSelectLot ? 'pointer' : 'default',
                color: 'var(--tf-ink)',
                fontSize: '13px',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="tf-live-dot" aria-hidden="true" />
              <span style={{ fontWeight: 600 }}>{lot.produce}</span>
              <span style={{ color: 'var(--tf-muted)' }}>{lot.origin}</span>
              <span className="tf-tabular" style={{ color: 'var(--tf-muted)' }}>
                Ask {formatInr(lot.askPricePerKg)}/kg
              </span>
              <span className="tf-tabular" style={{ fontWeight: 600, color: 'var(--tf-primary)' }}>
                {highest > 0 ? `Bid ${formatInr(highest)}/kg` : 'No bids yet'}
              </span>
              {diff !== 0 ? (
                <span
                  className="tf-tabular"
                  style={{
                    fontSize: '12px',
                    color: diff > 0 ? 'var(--tf-primary)' : 'var(--tf-live)',
                  }}
                >
                  {diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
