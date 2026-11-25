import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { networkState, simulateNetworkState, refreshLots } = useTradeStore();

  if (networkState === 'offline') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          backgroundColor: 'var(--tf-bg)',
          color: 'var(--tf-ink)',
        }}
      >
        <div
          className="tf-card tf-fade-up"
          style={{
            maxWidth: '500px',
            width: '100%',
            padding: '36px 28px',
            textAlign: 'center',
            display: 'grid',
            gap: '14px',
          }}
        >
          <div style={{ width: '150px', height: '140px', margin: '0 auto', display: 'grid', placeItems: 'center' }}>
            <svg width="144" height="136" viewBox="0 0 144 136" fill="none" aria-hidden="true">
              <circle cx="72" cy="68" r="54" stroke="#D33F24" strokeOpacity="0.28" strokeWidth="4" strokeDasharray="8 8" className="tf-anim-orbit" />
              <circle cx="72" cy="68" r="34" fill="#FDECE8" stroke="#D33F24" strokeWidth="2.5" className="tf-anim-float" />
              <path d="M56 54L88 82M88 54L56 82" stroke="#D33F24" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="tf-label" style={{ color: 'var(--tf-live-text)' }}>
            Offline · No Internet Signal
          </span>
          <h1 className="tf-heading-font" style={{ margin: 0, fontSize: '30px', fontWeight: 600 }}>
            Connection lost to desk.
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--tf-muted)' }}>
            Check your Wi-Fi or mobile data connection. Live bids and ask prices will resume automatically once back online.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                simulateNetworkState(null);
                void refreshLots(true);
              }}
              className="tf-btn tf-btn-bb"
            >
              <RefreshCw size={16} />
              Retry Connection
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {networkState === 'slow' ? (
        <div
          role="status"
          style={{
            backgroundColor: 'var(--tf-amber-bg)',
            color: 'var(--tf-amber-ink)',
            borderBottom: '1px solid #DECFA9',
            padding: '8px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <WifiOff size={15} />
          <span>
            Slow internet detected — live bid ticker updates may take a few extra seconds.
          </span>
          <button
            type="button"
            onClick={() => {
              simulateNetworkState(null);
              void refreshLots(false);
            }}
            style={{
              background: 'none',
              border: '1px solid currentColor',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              color: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Wifi size={12} />
            Recheck
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
}
