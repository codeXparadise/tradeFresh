import { useMemo, useState } from 'react';
import { Skeleton, TextInput } from '@astryxdesign/core';
import { RefreshCw, Search } from 'lucide-react';
import { LotCard } from '../components/LotCard';
import { LotRow } from '../components/LotRow';
import { useTradeStore } from '../context/TradeStoreContext';
import type { ProduceCategory } from '../types/trade';
import { getHighestBidAmount } from '../utils/format';

interface LiveBidsPageProps {
  onNavigate: (path: string) => void;
}

type SortOption = 'ending' | 'highest' | 'ask';

export function LiveBidsPage({ onNavigate }: LiveBidsPageProps) {
  const { lots, siteSettings, isLoading, nowMs, refreshLots } = useTradeStore();
  const [category, setCategory] = useState<'All' | ProduceCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('ending');
  const [query, setQuery] = useState('');

  const dynamicCategories = [
    'All',
    ...(siteSettings.categories ?? []).map((c) => c.name),
  ];

  const openLots = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = lots
      .filter((lot) => lot.status === 'open')
      .filter((lot) => (category === 'All' ? true : lot.produce === category))
      .filter((lot) => {
        if (!q) return true;
        return (
          lot.produce.toLowerCase().includes(q) ||
          lot.origin.toLowerCase().includes(q) ||
          lot.lotCode.toLowerCase().includes(q)
        );
      });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'highest') {
        return getHighestBidAmount(b) - getHighestBidAmount(a);
      }
      if (sortBy === 'ask') {
        return a.askPricePerKg - b.askPricePerKg;
      }
      return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
    });
  }, [category, lots, query, sortBy]);

  return (
    <section className="tf-container" style={{ paddingBlock: '32px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className="tf-live-dot" aria-hidden="true" />
            <span className="tf-label" style={{ color: '#B33922' }}>
              Live
            </span>
          </div>
          <h1
            className="tf-heading-font"
            style={{ margin: '4px 0 0', fontSize: '34px', lineHeight: 1.1, fontWeight: 600 }}
          >
            Active Produce Lots
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '15px', color: 'var(--tf-muted)' }}>
            Select any grade-checked lot to place a bid above the current highest offer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshLots(true)}
          className="tf-btn tf-btn-secondary"
        >
          <RefreshCw size={16} strokeWidth={1.75} />
          Refresh desk
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="tf-card"
        style={{
          padding: '16px',
          marginBottom: '24px',
          display: 'grid',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {dynamicCategories.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`tf-btn ${
                  active ? 'tf-btn-primary' : 'tf-btn-secondary'
                }`}
                style={{ paddingInline: '14px', fontSize: '14px' }}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
          }}
          className="tf-filter-controls"
        >
          <TextInput
            label="Search lots"
            isLabelHidden
            type="search"
            value={query}
            onChange={(val) => setQuery(val)}
            placeholder="Search produce, village origin, or lot ID (e.g. Nashik)"
            startIcon={<Search size={16} />}
            size="lg"
          />

          <div>
            <label htmlFor="tf-sort-select" className="tf-label" style={{ display: 'none' }}>
              Sort lots
            </label>
            <select
              id="tf-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="tf-select"
              aria-label="Sort lots"
            >
              <option value="ending">Sort: Ending soon</option>
              <option value="highest">Sort: Highest bid</option>
              <option value="ask">Sort: Lowest ask price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="tf-card" style={{ padding: '20px', display: 'grid', gap: '12px' }}>
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <Skeleton height={22} radius={1} />
              <Skeleton height={22} radius={1} />
              <Skeleton height={22} radius={1} />
              <Skeleton height={36} radius={1} />
            </div>
          ))}
        </div>
      ) : openLots.length === 0 ? (
        <div
          className="tf-card"
          style={{ padding: '40px 24px', textAlign: 'center', display: 'grid', gap: '12px', justifyItems: 'center' }}
        >
          <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '22px' }}>
            No matching open lots
          </h2>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--tf-muted)' }}>
            Try clearing the category chip or search term to view active mandi lots.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setQuery('');
            }}
            className="tf-btn tf-btn-secondary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table (>= 768px) */}
          <div className="tf-card tf-lots-table-wrap" style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '15px',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--tf-border-strong)',
                    backgroundColor: 'var(--tf-bg)',
                  }}
                >
                  <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">
                    Produce
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">
                    Grade
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">
                    Quantity
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">
                    Origin
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">
                    Ask price
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">
                    Current highest bid
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">
                    Time left
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {openLots.map((lot) => (
                  <LotRow
                    key={lot.id}
                    lot={lot}
                    nowMs={nowMs}
                    onOpen={(id) => onNavigate(`/lots/${id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards (< 768px) */}
          <div className="tf-lots-cards-wrap" style={{ display: 'grid', gap: '12px' }}>
            {openLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                nowMs={nowMs}
                onOpen={(id) => onNavigate(`/lots/${id}`)}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .tf-lots-table-wrap { display: none; }
        .tf-lots-cards-wrap { display: grid; }
        @media (min-width: 768px) {
          .tf-filter-controls {
            grid-template-columns: 1fr 240px !important;
          }
          .tf-lots-table-wrap { display: block; }
          .tf-lots-cards-wrap { display: none !important; }
        }
      `}</style>
    </section>
  );
}
