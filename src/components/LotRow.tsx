import { ArrowUpRight } from 'lucide-react';
import type { Lot } from '../types/trade';
import {
  formatCountdown,
  formatInr,
  formatKg,
  getHighestBidAmount,
  isLotBiddingClosed,
} from '../utils/format';

interface LotRowProps {
  lot: Lot;
  nowMs: number;
  onOpen: (lotId: string) => void;
}

export function LotRow({ lot, nowMs, onOpen }: LotRowProps) {
  const highest = getHighestBidAmount(lot);
  const timeLeft = formatCountdown(lot.endsAt, nowMs);
  const closed = isLotBiddingClosed(lot, nowMs);

  return (
    <tr
      className="tf-tr-hover"
      style={{
        borderBottom: '1px solid var(--tf-border)',
        backgroundColor: 'var(--tf-surface)',
      }}
    >
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          {!closed ? (
            <span
              className="tf-live-dot"
              style={{ marginTop: '7px' }}
              aria-hidden="true"
            />
          ) : null}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--tf-ink)' }}>
              {lot.title || lot.produce}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
              {lot.lotCode} · {lot.produce}
              {lot.subCategory ? ` (${lot.subCategory})` : ''}
              {lot.tags.length > 0 ? ` · ${lot.tags.slice(0, 2).join(', ')}` : ''}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--tf-ink)' }}>
        {lot.grade}
      </td>
      <td
        className="tf-tabular"
        style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 500 }}
      >
        {formatKg(lot.quantityKg)}
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--tf-ink)' }}>
        {lot.origin}
      </td>
      <td
        className="tf-tabular"
        style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--tf-muted)' }}
      >
        {formatInr(lot.askPricePerKg)}/kg
      </td>
      <td
        className="tf-tabular"
        style={{
          padding: '14px 16px',
          textAlign: 'right',
          fontWeight: 600,
          color: highest > 0 ? 'var(--tf-primary)' : 'var(--tf-muted)',
        }}
      >
        {highest > 0 ? `${formatInr(highest)}/kg` : '—'}
      </td>
      <td
        className="tf-tabular"
        style={{
          padding: '14px 16px',
          textAlign: 'right',
          fontWeight: 600,
          color: closed ? 'var(--tf-live-text)' : 'var(--tf-ink)',
        }}
      >
        {closed ? 'Bidding Closed' : timeLeft}
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => onOpen(lot.id)}
          className="tf-btn tf-btn-secondary"
          style={{ paddingInline: '14px', fontSize: '14px' }}
        >
          {closed ? 'View' : 'Bid now'}
          <ArrowUpRight className="tf-arrow-nudge" size={16} strokeWidth={1.75} />
        </button>
      </td>
    </tr>
  );
}
