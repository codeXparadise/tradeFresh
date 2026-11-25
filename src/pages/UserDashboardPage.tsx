import { ArrowUpRight, Bell, CheckCheck } from 'lucide-react';
import { LiveTicker } from '../components/LiveTicker';
import { MetricCard } from '../components/MetricCard';
import { StatusChip } from '../components/StatusChip';
import { useTradeStore } from '../context/TradeStoreContext';
import {
  formatCountdown,
  formatInr,
  formatKg,
  formatTimestamp,
  getHighestBidAmount,
  isLotBiddingClosed,
} from '../utils/format';

export type UserSection = 'overview' | 'deals' | 'notifications';

interface UserDashboardPageProps {
  section: UserSection;
  onNavigate: (path: string) => void;
}

export function UserDashboardPage({
  section,
  onNavigate,
}: UserDashboardPageProps) {
  const {
    lots,
    user,
    nowMs,
    notifications,
    unreadCount,
    markAllNotificationsRead,
  } = useTradeStore();

  const openLots = lots.filter((l) => l.status === 'open');
  const myBidsLots = lots.filter((l) =>
    l.bids.some((b) => b.vendorLabel === user?.vendorCode)
  );
  const myDeals = lots.filter(
    (l) =>
      l.status !== 'open' &&
      (l.winningVendorId === user?.vendorCode ||
        l.bids.some((b) => b.vendorLabel === user?.vendorCode))
  );

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Live Bid / Ask Ticker inside User Dashboard */}
      <div className="tf-card" style={{ overflow: 'hidden' }}>
        <LiveTicker
          lots={lots}
          onSelectLot={(lotId) => onNavigate(`/lots/${lotId}`)}
        />
      </div>

      {section === 'notifications' ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <span className="tf-label">Activity Feed</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '30px', fontWeight: 600 }}>
                Notifications
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void markAllNotificationsRead()}
              className="tf-btn tf-btn-secondary"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          </div>

          <div className="tf-card" style={{ overflow: 'hidden' }}>
            {notifications.length === 0 ? (
              <p style={{ margin: 0, padding: '24px', color: 'var(--tf-muted)' }}>
                No notifications yet.
              </p>
            ) : (
              notifications.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom:
                      idx === notifications.length - 1
                        ? 'none'
                        : '1px solid var(--tf-border)',
                    backgroundColor: item.isRead
                      ? 'var(--tf-surface)'
                      : 'var(--tf-sage)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                      {item.body}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="tf-tabular" style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
                      {formatTimestamp(item.createdAt)}
                    </span>
                    {item.lotId ? (
                      <button
                        type="button"
                        onClick={() => onNavigate(`/lots/${item.lotId}`)}
                        className="tf-btn tf-btn-secondary"
                        style={{ minHeight: '36px', paddingInline: '12px', fontSize: '13px' }}
                      >
                        Open lot
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {section === 'deals' ? (
        <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <span className="tf-label">Vendor Deals</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '30px', fontWeight: 600 }}>
                My Requested & Locked Deals
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/tracker')}
              className="tf-btn tf-btn-secondary"
            >
              Open Shipping Tracker
            </button>
          </div>

          <div className="tf-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--tf-border-strong)', backgroundColor: 'var(--tf-bg)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Lot</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Locked Rate</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Action</th>
                </tr>
              </thead>
              <tbody>
                {(myDeals.length > 0 ? myDeals : myBidsLots).map((lot) => {
                  const rate = lot.winningBidPerKg ?? getHighestBidAmount(lot);
                  return (
                    <tr key={lot.id} style={{ borderBottom: '1px solid var(--tf-border)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{lot.title || lot.produce}</div>
                        <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
                          {lot.lotCode} · {lot.origin}
                        </div>
                      </td>
                      <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {formatKg(lot.quantityKg)}
                      </td>
                      <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>
                        {rate > 0 ? `${formatInr(rate)}/kg` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusChip status={lot.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(
                              lot.status === 'open' ? `/lots/${lot.id}` : '/tracker'
                            )
                          }
                          className="tf-btn tf-btn-secondary"
                          style={{ minHeight: '36px', paddingInline: '12px', fontSize: '13px' }}
                        >
                          {lot.status === 'open' ? 'View lot' : 'Track shipping'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {section === 'overview' ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
            <div>
              <span className="tf-label">Vendor Overview · {user?.vendorCode}</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
                Welcome back, {user?.displayName || 'Buyer'}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/lots')}
              className="tf-btn tf-btn-primary"
            >
              Browse all live lots
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="tf-user-metrics">
            <MetricCard label="Open lots" value={openLots.length} />
            <MetricCard label="Lots I bid on" value={myBidsLots.length} />
            <MetricCard label="Locked deals" value={myDeals.length} />
            <MetricCard label="Unread alerts" value={unreadCount} />
          </div>

          <div className="tf-user-grid">
            {/* Requested / Active Bids */}
            <div className="tf-card" style={{ overflow: 'hidden' }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--tf-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                  Live lots & my requested deals
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/deals')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tf-primary)', fontSize: '13px', fontWeight: 600 }}
                >
                  All deals →
                </button>
              </div>
              <div style={{ display: 'grid' }}>
                {openLots.slice(0, 4).map((lot, idx) => {
                  const high = getHighestBidAmount(lot);
                  return (
                    <div
                      key={lot.id}
                      style={{
                        padding: '14px 20px',
                        borderBottom:
                          idx === Math.min(3, openLots.length - 1)
                            ? 'none'
                            : '1px solid var(--tf-border)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={lot.imageUrl}
                          alt={lot.produce}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>
                            {lot.title || lot.produce}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--tf-muted)' }}>
                            {lot.origin} · {formatKg(lot.quantityKg)} · Ask {formatInr(lot.askPricePerKg)}/kg
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="tf-tabular" style={{ fontWeight: 600, color: 'var(--tf-primary)' }}>
                            {high > 0 ? `${formatInr(high)}/kg` : 'No bids'}
                          </div>
                          <div
                            className="tf-tabular"
                            style={{
                              fontSize: '12px',
                              fontWeight: isLotBiddingClosed(lot, nowMs) ? 600 : 400,
                              color: isLotBiddingClosed(lot, nowMs)
                                ? 'var(--tf-live-text)'
                                : 'var(--tf-muted)',
                            }}
                          >
                            {isLotBiddingClosed(lot, nowMs)
                              ? 'Bidding Closed'
                              : formatCountdown(lot.endsAt, nowMs)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate(`/lots/${lot.id}`)}
                          className={`tf-btn ${
                            isLotBiddingClosed(lot, nowMs)
                              ? 'tf-btn-secondary'
                              : 'tf-btn-bb'
                          }`}
                          style={{ minHeight: '38px', paddingInline: '12px', fontSize: '13px' }}
                        >
                          {isLotBiddingClosed(lot, nowMs) ? 'Closed' : 'Bid'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Notifications Panel */}
            <div className="tf-card" style={{ overflow: 'hidden', alignSelf: 'start' }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--tf-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} />
                  <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                    Alerts
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/notifications')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tf-primary)', fontSize: '13px', fontWeight: 600 }}
                >
                  View all →
                </button>
              </div>
              <div>
                {notifications.slice(0, 4).map((n, idx) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 18px',
                      borderBottom:
                        idx === Math.min(3, notifications.length - 1)
                          ? 'none'
                          : '1px solid var(--tf-border)',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{n.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                      {n.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <style>{`
        .tf-user-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .tf-user-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .tf-user-metrics {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .tf-user-grid {
            grid-template-columns: 1.35fr 0.85fr;
          }
        }
      `}</style>
    </div>
  );
}
