import type { LotStatus } from '../types/trade';

const STATUS_STYLE: Record<
  LotStatus,
  { label: string; bg: string; fg: string; border: string }
> = {
  open: {
    label: 'Open',
    bg: 'var(--tf-sage)',
    fg: 'var(--tf-primary)',
    border: '#C6D2BF',
  },
  qc_pending: {
    label: 'Quality check pending',
    bg: 'var(--tf-amber-bg)',
    fg: 'var(--tf-amber-ink)',
    border: '#DECFA9',
  },
  locked: {
    label: 'Locked',
    bg: 'var(--tf-primary)',
    fg: 'var(--tf-bg)',
    border: 'var(--tf-primary)',
  },
  dispatched: {
    label: 'Dispatched',
    bg: 'var(--tf-stone-bg)',
    fg: 'var(--tf-ink)',
    border: 'var(--tf-border-strong)',
  },
  delivered: {
    label: 'Delivered',
    bg: 'var(--tf-stone-bg)',
    fg: 'var(--tf-stone-ink)',
    border: 'var(--tf-border)',
  },
};

export function StatusChip({ status }: { status: LotStatus }) {
  const cfg = STATUS_STYLE[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: 1.2,
        backgroundColor: cfg.bg,
        color: cfg.fg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
