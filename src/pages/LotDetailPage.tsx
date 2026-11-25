import { ArrowLeft } from 'lucide-react';
import { BidPanel } from '../components/BidPanel';
import { StatusChip } from '../components/StatusChip';
import { useTradeStore } from '../context/TradeStoreContext';
import { formatInr, formatKg, getHighestBidAmount } from '../utils/format';

interface LotDetailPageProps {
  lotId: string;
  onNavigate: (path: string) => void;
}

export function LotDetailPage({ lotId, onNavigate }: LotDetailPageProps) {
  const { lots } = useTradeStore();
  const lot = lots.find((item) => item.id === lotId);

  if (!lot) {
    return (
      <section style={{ paddingBlock: '24px' }}>
        <div className="tf-card" style={{ padding: '32px', maxWidth: '520px' }}>
          <h1 className="tf-heading-font" style={{ margin: 0, fontSize: '26px' }}>
            Lot not found
          </h1>
          <p style={{ color: 'var(--tf-muted)', marginTop: '8px' }}>
            This lot may have been deleted or reset.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/lots')}
            className="tf-btn tf-btn-primary"
            style={{ marginTop: '12px' }}
          >
            Back to live lots
          </button>
        </div>
      </section>
    );
  }

  const highest = getHighestBidAmount(lot);

  const lotFacts: Array<{ label: string; value: string }> = [
    { label: 'Lot code', value: lot.lotCode },
    { label: 'Produce & grade', value: `${lot.produce} · ${lot.grade}` },
    { label: 'Lot weight', value: formatKg(lot.quantityKg) },
    { label: 'Farm origin', value: `${lot.origin} (${lot.farmName})` },
    { label: 'Harvested', value: lot.harvestDate },
    { label: 'Dispatch hub', value: lot.traderContact.hub },
  ];

  const qualityFacts: Array<{ label: string; value: string }> = [
    { label: 'Assigned grade', value: lot.qualityReport.grade },
    { label: 'Moisture content', value: `${lot.qualityReport.moisturePct}%` },
    { label: 'Size grading', value: lot.qualityReport.sizeGrading },
    { label: 'Defect tolerance', value: `${lot.qualityReport.defectPct}%` },
    { label: 'Tested by', value: lot.qualityReport.testedBy },
    { label: 'Test timestamp', value: lot.qualityReport.testedAt },
    { label: 'Inspection note', value: lot.qualityReport.photoNote },
  ];

  return (
    <section className="tf-lot-detail-page" style={{ paddingBottom: '72px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => onNavigate('/lots')}
          className="tf-btn tf-btn-ghost"
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          Back to live lots
        </button>
      </div>

      <div className="tf-lot-detail-grid">
        <div style={{ display: 'grid', gap: '24px', alignContent: 'start' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <StatusChip status={lot.status} />
              <span className="tf-label">{lot.lotCode}</span>
              {(lot.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: 'var(--tf-bg)',
                    border: '1px solid var(--tf-border)',
                    color: 'var(--tf-muted)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1
              className="tf-heading-font"
              style={{ margin: 0, fontSize: '34px', lineHeight: 1.08, fontWeight: 600 }}
            >
              {lot.title || `${lot.produce} — ${formatKg(lot.quantityKg)}`}
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--tf-muted)' }}>
              {lot.description ||
                `Sourced directly from ${lot.farmName}, ${lot.origin}.`}
            </p>
          </div>

          <div className="tf-card" style={{ overflow: 'hidden' }}>
            <img
              src={lot.imageUrl}
              alt={`${lot.produce} lot sample from ${lot.origin}`}
              style={{
                width: '100%',
                height: '280px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          <div className="tf-card" style={{ padding: '20px' }}>
            <h2
              className="tf-heading-font"
              style={{ margin: '0 0 14px', fontSize: '20px', fontWeight: 600 }}
            >
              Lot & farm specifications
            </h2>
            <dl style={{ margin: 0, display: 'grid', gap: '0px' }}>
              {lotFacts.map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingBlock: '12px',
                    borderBottom:
                      idx === lotFacts.length - 1
                        ? 'none'
                        : '1px solid var(--tf-border)',
                  }}
                >
                  <dt style={{ fontSize: '14px', color: 'var(--tf-muted)' }}>
                    {row.label}
                  </dt>
                  <dd
                    className="tf-tabular"
                    style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="tf-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <h2
                className="tf-heading-font"
                style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}
              >
                Quality report summary
              </h2>
              <span className="tf-label">
                {lot.qualityReport.outcome.toUpperCase()}
              </span>
            </div>
            <dl style={{ margin: 0, display: 'grid', gap: '0px' }}>
              {qualityFacts.map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingBlock: '12px',
                    borderBottom:
                      idx === qualityFacts.length - 1
                        ? 'none'
                        : '1px solid var(--tf-border)',
                  }}
                >
                  <dt style={{ fontSize: '14px', color: 'var(--tf-muted)' }}>
                    {row.label}
                  </dt>
                  <dd
                    className="tf-tabular"
                    style={{ margin: 0, fontSize: '14px', fontWeight: 500, textAlign: 'right' }}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div id="tf-bid-panel-anchor">
          <BidPanel
            lot={lot}
            onRequireAuth={() => onNavigate('/auth?portal=user')}
            onOpenProfile={() => onNavigate('/profile')}
          />
        </div>
      </div>

      <div className="tf-mobile-bottom-bar">
        <div>
          <div className="tf-label">Highest bid</div>
          <div className="tf-tabular" style={{ fontWeight: 600, fontSize: '16px', color: 'var(--tf-primary)' }}>
            {highest > 0 ? `${formatInr(highest)}/kg` : `Ask ${formatInr(lot.askPricePerKg)}/kg`}
          </div>
        </div>
        <a
          href="#tf-bid-panel-anchor"
          className="tf-btn tf-btn-primary"
          style={{ minWidth: '150px' }}
        >
          Place bid
        </a>
      </div>

      <style>{`
        .tf-lot-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .tf-mobile-bottom-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 35;
          background-color: var(--tf-surface);
          border-top: 1px solid var(--tf-border);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        @media (min-width: 960px) {
          .tf-lot-detail-grid {
            grid-template-columns: 1fr 380px;
            align-items: start;
          }
          .tf-mobile-bottom-bar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
