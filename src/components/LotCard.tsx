import { ArrowUpRight, Clock } from 'lucide-react';
import type { Lot } from '../types/trade';
import {
  formatCountdown,
  formatInr,
  formatKg,
  getHighestBidAmount,
  isLotBiddingClosed,
  isLotTimedOut,
} from '../utils/format';

interface LotCardProps {
  lot: Lot;
  nowMs: number;
  onOpen: (lotId: string) => void;
}

export function LotCard({ lot, nowMs, onOpen }: LotCardProps) {
  const highest = getHighestBidAmount(lot);
  const timeLeft = formatCountdown(lot.endsAt, nowMs);
  const timedOut = isLotTimedOut(lot, nowMs);
  const closed = isLotBiddingClosed(lot, nowMs);

  return (
    <article
      className="tf-card tf-card-interactive"
      style={{ overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto 1fr' }}
    >
      <div className="tf-card-media" style={{ position: 'relative' }}>
        <img
          src={lot.imageUrl}
          alt={lot.title || `${lot.produce} lot from ${lot.origin}`}
          loading="lazy"
          style={{
            width: '100%',
            height: '182px',
            objectFit: 'cover',
            display: 'block',
            filter: closed ? 'grayscale(35%) opacity(0.85)' : undefined,
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            backgroundColor: closed ? '#B8321A' : '#2F7A18',
            color: '#FFFFFF',
          }}
        >
          {timedOut ? 'Bidding Closed' : closed ? 'Deal Locked' : lot.grade}
        </span>
      </div>

      <div
        style={{
          padding: '18px',
          display: 'grid',
          gap: '14px',
          alignContent: 'space-between',
        }}
      >
        <div style={{ display: 'grid', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '12px',
                color: 'var(--tf-muted)',
              }}
            >
              {!closed ? <span className="tf-live-dot" aria-hidden="true" /> : <Clock size={12} />}
              <strong
                style={{
                  fontWeight: 600,
                  color: closed ? 'var(--tf-live-text)' : '#2F7A18',
                }}
              >
                {timedOut ? 'Closed (Time Out)' : closed ? 'Locked' : 'Live'}
              </strong>
              <span>{lot.lotCode}</span>
            </span>

            <span
              className="tf-tabular"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: closed ? 'var(--tf-live-text)' : 'var(--tf-ink)',
              }}
            >
              {closed ? 'Bidding Closed' : timeLeft}
            </span>
          </div>

          <div>
            <h3
              className="tf-heading-font"
              style={{ margin: 0, fontSize: '20px', lineHeight: 1.2, fontWeight: 600 }}
            >
              {lot.title || `${lot.origin} ${lot.produce}`}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--tf-muted)' }}>
              {lot.origin} · <span className="tf-tabular">{formatKg(lot.quantityKg)}</span> · {lot.produce}
              {lot.subCategory ? ` (${lot.subCategory})` : ''}
            </p>
          </div>

          {lot.tags.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '2px' }}>
              {lot.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--tf-bb-green-soft)',
                    color: 'var(--tf-primary)',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--tf-border)',
          }}
        >
          <div style={{ display: 'flex', gap: '18px' }}>
            <div>
              <div className="tf-label">Ask</div>
              <div className="tf-tabular" style={{ fontSize: '15px', fontWeight: 500 }}>
                {formatInr(lot.askPricePerKg)}/kg
              </div>
            </div>
            <div>
              <div className="tf-label">High bid</div>
              <div
                className="tf-tabular"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: highest > 0 ? 'var(--tf-primary)' : 'var(--tf-muted)',
                }}
              >
                {highest > 0 ? `${formatInr(highest)}/kg` : '—'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpen(lot.id)}
            className={`tf-btn ${closed ? 'tf-btn-secondary' : 'tf-btn-bb'}`}
            style={{ minHeight: '40px', paddingInline: '14px', fontSize: '14px' }}
          >
            {closed ? 'View Summary' : 'Bid'}
            <ArrowUpRight className="tf-arrow-nudge" size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  );
}
