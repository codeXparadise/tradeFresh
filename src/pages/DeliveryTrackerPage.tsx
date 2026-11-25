import { useMemo } from 'react';
import { Bell, Check, MapPin, Phone } from 'lucide-react';
import { StatusChip } from '../components/StatusChip';
import { Timeline } from '../components/Timeline';
import { useTradeStore } from '../context/TradeStoreContext';
import { formatInr, formatKg, formatTimestamp } from '../utils/format';

interface DeliveryTrackerPageProps {
  onNavigate: (path: string) => void;
}

export function DeliveryTrackerPage({ onNavigate }: DeliveryTrackerPageProps) {
  const { lots, notifications, markNotificationRead, user } = useTradeStore();

  const lockedDeals = useMemo(() => {
    const allLocked = lots.filter((l) => l.status !== 'open');
    if (!user || user.role === 'admin') return allLocked;
    const mine = allLocked.filter(
      (l) => l.winningVendorId === user.vendorCode
    );
    return mine.length > 0 ? mine : allLocked;
  }, [lots, user]);

  return (
    <section className="tf-container" style={{ paddingBlock: '32px', display: 'grid', gap: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
        }}
      >
        <div>
          <span className="tf-label">Vendor · Fulfillment</span>
          <h1
            className="tf-heading-font"
            style={{ margin: '4px 0 0', fontSize: '34px', lineHeight: 1.1, fontWeight: 600 }}
          >
            Deal & Delivery Tracker
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '15px', color: 'var(--tf-muted)' }}>
            Live deal-lock alerts, trader quality sign-off, and gate delivery stages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/lots')}
          className="tf-btn tf-btn-secondary"
        >
          Browse live lots
        </button>
      </div>

      {/* Deal Notifications Inbox */}
      {notifications.length > 0 ? (
        <div className="tf-card" style={{ padding: '20px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} strokeWidth={1.75} />
            <span className="tf-label">Deal notifications</span>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '4px',
                  backgroundColor: n.isRead ? 'var(--tf-bg)' : 'var(--tf-sage)',
                  border: '1px solid var(--tf-border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{n.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                    {n.message || n.body} · {formatTimestamp(n.createdAt)}
                  </div>
                </div>
                {!n.isRead ? (
                  <button
                    type="button"
                    onClick={() => void markNotificationRead(n.id)}
                    className="tf-btn tf-btn-secondary"
                    style={{ minHeight: '36px', fontSize: '13px', paddingInline: '12px' }}
                  >
                    <Check size={14} />
                    Mark as read
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>Read</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {lockedDeals.length === 0 ? (
        <div className="tf-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
          <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '22px' }}>
            No locked deals yet
          </h2>
          <p style={{ margin: '8px 0 16px', color: 'var(--tf-muted)' }}>
            Place a winning bid and wait for the trader to lock the deal.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/lots')}
            className="tf-btn tf-btn-primary"
          >
            Go to Live Lots
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {lockedDeals.map((deal) => (
            <article
              key={deal.id}
              className="tf-card tf-tracker-card"
              style={{ padding: '24px', display: 'grid', gap: '24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--tf-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StatusChip status={deal.status} />
                    <span className="tf-label">{deal.lotCode}</span>
                  </div>
                  <h2
                    className="tf-heading-font"
                    style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 600 }}
                  >
                    {deal.produce} · {deal.grade} ({formatKg(deal.quantityKg)})
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--tf-muted)' }}>
                    Origin: {deal.origin} · Locked to{' '}
                    <strong style={{ color: 'var(--tf-ink)' }}>
                      {deal.winningVendorId ?? 'Vendor'}
                    </strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tf-label">Locked rate</div>
                  <div
                    className="tf-heading-font tf-tabular"
                    style={{
                      fontSize: '26px',
                      fontWeight: 600,
                      color: 'var(--tf-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {deal.winningBidPerKg ? `${formatInr(deal.winningBidPerKg)}/kg` : '—'}
                  </div>
                </div>
              </div>

              <div className="tf-tracker-body">
                <Timeline steps={deal.timeline} />

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--tf-bg)',
                    border: '1px solid var(--tf-border)',
                    display: 'grid',
                    gap: '14px',
                    alignContent: 'start',
                  }}
                >
                  <div>
                    <div className="tf-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} />
                      Delivery address
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 500 }}>
                      {deal.deliveryAddress}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--tf-border)', paddingTop: '12px' }}>
                    <div className="tf-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      Trader desk contact
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 600 }}>
                      {deal.traderContact.name}
                    </p>
                    <p className="tf-tabular" style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--tf-muted)' }}>
                      {deal.traderContact.phone} · {deal.traderContact.hub}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <style>{`
        .tf-tracker-body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 820px) {
          .tf-tracker-body {
            grid-template-columns: 1.4fr 1fr;
          }
        }
      `}</style>
    </section>
  );
}
