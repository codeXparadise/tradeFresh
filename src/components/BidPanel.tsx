import { useEffect, useState } from 'react';
import { Lock, Minus, Plus } from 'lucide-react';
import type { Lot } from '../types/trade';
import { useTradeStore } from '../context/TradeStoreContext';
import {
  formatCountdown,
  formatInr,
  formatTimestamp,
  getHighestBidAmount,
  getHighestBidEntry,
  isLotBiddingClosed,
  isLotTimedOut,
} from '../utils/format';

interface BidPanelProps {
  lot: Lot;
  onRequireAuth: () => void;
  onOpenProfile: () => void;
}

export function BidPanel({ lot, onRequireAuth, onOpenProfile }: BidPanelProps) {
  const {
    role,
    user,
    placeBid,
    updateAskPrice,
    lockDeal,
    nowMs,
    isSyncing,
  } = useTradeStore();
  const highest = getHighestBidAmount(lot);
  const topBidEntry = getHighestBidEntry(lot);
  const minimumNext = highest > 0 ? highest + 1 : lot.askPricePerKg;

  const [bidValue, setBidValue] = useState<string>(String(minimumNext));
  const [askInput, setAskInput] = useState<string>(String(lot.askPricePerKg));
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  useEffect(() => {
    const nextSuggested = highest > 0 ? highest + 1 : lot.askPricePerKg;
    setBidValue(String(nextSuggested));
  }, [highest, lot.askPricePerKg, lot.id]);

  useEffect(() => {
    setAskInput(String(lot.askPricePerKg));
  }, [lot.askPricePerKg, lot.id]);

  const numericBid = Number(bidValue);
  const timedOut = isLotTimedOut(lot, nowMs);
  const isClosed = isLotBiddingClosed(lot, nowMs);
  const needsProfile =
    role === 'user' && (!user?.phone?.trim() || !user?.address?.trim());

  const handleAdjust = (delta: number) => {
    setError(null);
    const current =
      Number.isFinite(numericBid) && numericBid > 0 ? numericBid : minimumNext;
    setBidValue(String(Math.max(1, Math.round(current + delta))));
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'guest') {
      onRequireAuth();
      return;
    }

    if (needsProfile) {
      triggerError(
        'Complete your mandatory contact & delivery address in Profile before bidding.'
      );
      return;
    }

    if (timedOut) {
      triggerError('Bidding window has timed out. Bidding is closed.');
      return;
    }

    if (isClosed) {
      triggerError('This lot has already been locked by the trader.');
      return;
    }
    if (!Number.isFinite(numericBid) || numericBid <= highest) {
      triggerError(
        highest > 0
          ? `Your bid must exceed the current highest bid (${formatInr(highest)}/kg).`
          : 'Enter a valid bid greater than ₹0/kg.'
      );
      return;
    }

    const res = await placeBid(lot.id, numericBid);
    if (!res.ok && res.error) {
      triggerError(res.error);
    }
  };

  const handleAdminAskUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const val = Number(askInput);
    if (!Number.isFinite(val) || val <= 0) {
      setError('Ask price must be greater than ₹0/kg.');
      return;
    }
    const res = await updateAskPrice(lot.id, val);
    if (!res.ok && res.error) setError(res.error);
  };

  const handleAdminLock = async () => {
    setError(null);
    const res = await lockDeal(lot.id);
    if (!res.ok && res.error) setError(res.error);
  };

  const recentBids = [...lot.bids]
    .sort((a, b) => b.amountPerKg - a.amountPerKg)
    .slice(0, 5);

  return (
    <aside
      className="tf-card"
      style={{
        padding: '20px',
        display: 'grid',
        gap: '18px',
        position: 'sticky',
        top: '84px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--tf-border)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {!isClosed ? <span className="tf-live-dot" aria-hidden="true" /> : null}
          <span
            className="tf-label"
            style={{ color: timedOut ? 'var(--tf-live-text)' : undefined }}
          >
            {timedOut
              ? 'Bidding closed · Timed out'
              : isClosed
              ? 'Bidding closed'
              : 'Live bidding'}
          </span>
        </div>
        <span
          className="tf-tabular"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: timedOut ? 'var(--tf-live-text)' : 'var(--tf-ink)',
          }}
        >
          {timedOut ? 'Closed' : isClosed ? 'Locked' : formatCountdown(lot.endsAt, nowMs)}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: 'var(--tf-bg)',
            border: '1px solid var(--tf-border)',
          }}
        >
          <div className="tf-label">Trader ask</div>
          <div
            className="tf-heading-font tf-tabular"
            style={{ fontSize: '24px', fontWeight: 600, marginTop: '4px' }}
          >
            {formatInr(lot.askPricePerKg)}
            <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--tf-muted)' }}>
              /kg
            </span>
          </div>
        </div>
        <div
          key={`high-${highest}`}
          className={highest > 0 ? 'tf-bid-flash' : undefined}
          style={{
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: 'var(--tf-sage)',
            border: '1px solid #C6D2BF',
          }}
        >
          <div className="tf-label" style={{ color: 'var(--tf-primary)' }}>
            Highest bid
          </div>
          <div
            className="tf-heading-font tf-tabular"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--tf-primary)',
              marginTop: '4px',
            }}
          >
            {highest > 0 ? formatInr(highest) : '—'}
            {highest > 0 ? (
              <span style={{ fontSize: '13px', fontWeight: 400 }}>/kg</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Role-Separated Action Area: Admin sets Ask / Locks Deal; Vendor Bids */}
      {role === 'admin' ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          <form onSubmit={handleAdminAskUpdate} style={{ display: 'grid', gap: '8px' }}>
            <label htmlFor="tf-admin-ask-input" className="tf-label">
              Admin ask price (₹ / kg)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <input
                id="tf-admin-ask-input"
                type="number"
                min={1}
                disabled={isClosed}
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                className="tf-input tf-tabular"
              />
              <button
                type="submit"
                disabled={isClosed || isSyncing}
                className="tf-btn tf-btn-secondary"
              >
                Update ask
              </button>
            </div>
          </form>

          {error ? (
            <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#B33922', fontWeight: 500 }}>
              {error}
            </p>
          ) : null}

          {!isClosed && topBidEntry ? (
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => void handleAdminLock()}
              className="tf-btn tf-btn-primary"
              style={{ width: '100%' }}
            >
              <Lock size={16} strokeWidth={1.75} />
              Lock deal with {topBidEntry.vendorLabel} ({formatInr(topBidEntry.amountPerKg)}/kg)
            </button>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--tf-muted)' }}>
              {isClosed
                ? 'This deal is locked. Manage QC & dispatch in Admin Deals.'
                : 'Waiting for vendors to place bids before locking.'}
            </p>
          )}
        </div>
      ) : (
        <>
          {needsProfile ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '4px',
                backgroundColor: 'var(--tf-amber-bg)',
                color: 'var(--tf-amber-ink)',
                border: '1px solid #DECFA9',
                display: 'grid',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <span>
                Add your phone and mandatory delivery address before placing a bid.
              </span>
              <button
                type="button"
                onClick={onOpenProfile}
                className="tf-btn tf-btn-primary"
                style={{ minHeight: '38px', fontSize: '13px' }}
              >
                Complete Profile
              </button>
            </div>
          ) : null}

          <form
            key={shakeKey}
            onSubmit={handleBidSubmit}
            className={error ? 'tf-shake-error' : undefined}
            style={{
              display: 'grid',
              gap: '12px',
              padding: error ? '10px' : '0px',
              borderRadius: '6px',
              border: error ? '1px solid var(--tf-live)' : 'none',
            }}
          >
            <label htmlFor="tf-bid-input" className="tf-label">
              Your bid (₹ / kg)
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 44px',
                gap: '8px',
              }}
            >
              <button
                type="button"
                aria-label="Decrease bid by ₹1"
                onClick={() => handleAdjust(-1)}
                disabled={isClosed}
                className="tf-btn tf-btn-secondary"
                style={{ padding: 0 }}
              >
                <Minus size={16} />
              </button>

              <input
                id="tf-bid-input"
                type="number"
                inputMode="numeric"
                min={1}
                value={bidValue}
                disabled={isClosed}
                onChange={(e) => {
                  setError(null);
                  setBidValue(e.target.value);
                }}
                className={`tf-input tf-tabular ${error ? 'tf-input-error' : ''}`}
                style={{ textAlign: 'center', fontWeight: 600, fontSize: '17px' }}
              />

              <button
                type="button"
                aria-label="Increase bid by ₹1"
                onClick={() => handleAdjust(1)}
                disabled={isClosed}
                className="tf-btn tf-btn-secondary"
                style={{ padding: 0 }}
              >
                <Plus size={16} />
              </button>
            </div>

            {error ? (
              <p
                role="alert"
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: 'var(--tf-live-text)',
                  fontWeight: 600,
                }}
              >
                {error}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--tf-muted)' }}>
                {timedOut
                  ? 'The bidding timer reached zero. No further bids accepted.'
                  : role === 'guest'
                  ? 'Sign in with a verified Vendor account to submit bids.'
                  : `Lot value at your bid: ${formatInr((numericBid || 0) * lot.quantityKg)}`}
              </p>
            )}

            <button
              type="submit"
              disabled={isClosed || isSyncing}
              className="tf-btn tf-btn-bb"
              style={{ width: '100%' }}
            >
              {timedOut
                ? 'Bidding Closed (Timed Out)'
                : isClosed
                ? 'Lot locked'
                : role === 'guest'
                ? 'Sign in to place bid'
                : 'Place bid'}
            </button>
          </form>
        </>
      )}

      <div style={{ borderTop: '1px solid var(--tf-border)', paddingTop: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <span className="tf-label">Recent bids</span>
          <span className="tf-tabular" style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
            {lot.bids.length} total
          </span>
        </div>

        {recentBids.length === 0 ? (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--tf-muted)' }}>
            No bids placed yet.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: '8px',
            }}
          >
            {recentBids.map((bid, idx) => (
              <li
                key={bid.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  paddingBottom: idx === recentBids.length - 1 ? 0 : '8px',
                  borderBottom:
                    idx === recentBids.length - 1
                      ? 'none'
                      : '1px solid var(--tf-border)',
                }}
              >
                <div>
                  <span style={{ fontWeight: idx === 0 ? 600 : 500 }}>
                    {bid.vendorLabel}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--tf-muted)',
                    }}
                  >
                    {formatTimestamp(bid.createdAt)}
                  </span>
                </div>
                <span
                  className="tf-tabular"
                  style={{
                    fontWeight: 600,
                    color: idx === 0 ? 'var(--tf-primary)' : 'var(--tf-ink)',
                  }}
                >
                  {formatInr(bid.amountPerKg)}/kg
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
