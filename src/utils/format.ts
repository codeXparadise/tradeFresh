import type { Lot } from '../types/trade';

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString('en-IN')} kg`;
}

export function getHighestBidAmount(lot: Lot): number {
  if (lot.bids.length === 0) return 0;
  return Math.max(...lot.bids.map((b) => b.amountPerKg));
}

export function getHighestBidEntry(lot: Lot) {
  if (lot.bids.length === 0) return null;
  return [...lot.bids].sort((a, b) => b.amountPerKg - a.amountPerKg)[0];
}

export function isLotTimedOut(lot: Lot, nowMs: number): boolean {
  if (lot.status !== 'open') return false;
  const endMs = new Date(lot.endsAt).getTime();
  return Number.isFinite(endMs) && endMs <= nowMs;
}

export function isLotBiddingClosed(lot: Lot, nowMs: number): boolean {
  if (lot.status !== 'open') return true;
  return isLotTimedOut(lot, nowMs);
}

export function formatCountdown(endsAtIso: string, nowMs: number): string {
  const diffSec = Math.max(
    0,
    Math.floor((new Date(endsAtIso).getTime() - nowMs) / 1000)
  );
  if (diffSec === 0) return '00:00:00';
  const hrs = Math.floor(diffSec / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':');
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
