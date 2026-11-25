import { AlertCircle, BellRing, CheckCircle2, X } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';

export function PopupAlerts() {
  const { popupAlerts, dismissPopupAlert } = useTradeStore();

  if (popupAlerts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '76px',
        right: '16px',
        zIndex: 85,
        display: 'grid',
        gap: '10px',
        width: 'min(360px, calc(100vw - 32px))',
        pointerEvents: 'none',
      }}
    >
      {popupAlerts.map((alert) => {
        const isErr = alert.tone === 'error';
        const isSuccess = alert.tone === 'success';
        return (
          <div
            key={alert.id}
            role={isErr ? 'alert' : 'status'}
            className={`tf-pop-in ${isErr ? 'tf-shake-error' : ''}`}
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'var(--tf-surface)',
              border: `1px solid ${
                isErr
                  ? 'var(--tf-live)'
                  : isSuccess
                  ? 'var(--tf-bb-green)'
                  : 'var(--tf-border-strong)'
              }`,
              borderLeftWidth: '4px',
              borderRadius: 'var(--tf-radius)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              boxShadow: 'var(--shadow-med)',
            }}
          >
            <span
              style={{
                marginTop: '2px',
                color: isErr
                  ? 'var(--tf-live)'
                  : isSuccess
                  ? '#5E9E31'
                  : 'var(--tf-primary)',
                display: 'inline-flex',
              }}
            >
              {isErr ? (
                <AlertCircle size={18} />
              ) : isSuccess ? (
                <CheckCircle2 size={18} />
              ) : (
                <BellRing size={18} />
              )}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              {alert.title ? (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: isErr ? 'var(--tf-live-text)' : 'var(--tf-muted)',
                  }}
                >
                  {alert.title}
                </div>
              ) : null}
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--tf-ink)' }}>
                {alert.message}
              </div>
            </div>

            <button
              type="button"
              aria-label="Dismiss alert"
              onClick={() => dismissPopupAlert(alert.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--tf-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'inline-flex',
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
