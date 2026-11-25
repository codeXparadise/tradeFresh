import { Check } from 'lucide-react';
import type { DeliveryStep } from '../types/trade';
import { formatTimestamp } from '../utils/format';

export function Timeline({ steps }: { steps: DeliveryStep[] }) {
  return (
    <ol
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gap: '0px',
      }}
    >
      {steps.map((step, index) => {
        const isDone = Boolean(step.completedAt);
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr',
              gap: '14px',
              position: 'relative',
              paddingBottom: isLast ? 0 : '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone
                    ? 'var(--tf-primary)'
                    : 'var(--tf-surface)',
                  color: isDone ? 'var(--tf-bg)' : 'var(--tf-muted)',
                  border: `1px solid ${
                    isDone ? 'var(--tf-primary)' : 'var(--tf-border-strong)'
                  }`,
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <Check size={14} strokeWidth={2.2} />
                ) : (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--tf-border-strong)',
                    }}
                  />
                )}
              </span>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: '1px',
                    flex: 1,
                    minHeight: '20px',
                    backgroundColor: isDone
                      ? 'var(--tf-primary)'
                      : 'var(--tf-border)',
                    marginTop: '4px',
                  }}
                />
              ) : null}
            </div>

            <div style={{ paddingTop: '1px' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: isDone ? 'var(--tf-ink)' : 'var(--tf-muted)',
                  }}
                >
                  {step.label}
                </span>
                <span
                  className="tf-tabular"
                  style={{ fontSize: '13px', color: 'var(--tf-muted)' }}
                >
                  {step.completedAt ? formatTimestamp(step.completedAt) : 'Pending'}
                </span>
              </div>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '14px',
                  color: isDone ? 'var(--tf-ink)' : 'var(--tf-muted)',
                }}
              >
                {step.statusLine}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
