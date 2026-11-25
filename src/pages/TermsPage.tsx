import { ArrowRight, CheckCircle2, FileText, Leaf } from 'lucide-react';
import { OrganicLeafSprig } from '../components/OrganicStickers';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  const clauses = [
    {
      num: '01',
      heading: 'Ask Price & Bidding Increments',
      body: 'Each lot carries an opening ask price per kg published by the Trade Fresh trader desk. Any new vendor bid must strictly exceed the highest recorded bid.',
    },
    {
      num: '02',
      heading: 'Timed Window Closure',
      body: 'Every auction displays a live countdown. Once the timer reaches zero, bidding automatically closes and the lot displays Bidding Closed — no late bids are accepted.',
    },
    {
      num: '03',
      heading: 'Binding Deal Lock & Quality Verification',
      body: 'When the trader locks a lot to the winning buyer, moisture percentage, size grading, and defect tolerance are signed off before reefer vehicle dispatch.',
    },
    {
      num: '04',
      heading: 'Dispatch & APMC Gate Settlement',
      body: 'The trader coordinates cold-chain or insulated transport from the aggregation yard to the buyer’s registered APMC delivery address.',
    },
  ];

  return (
    <div style={{ paddingBottom: '56px' }}>
      <section
        style={{
          backgroundColor: 'var(--tf-bb-green-soft)',
          borderBottom: '1px solid var(--tf-border)',
          paddingBlock: '38px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{ position: 'absolute', top: '8px', right: '4%', opacity: 0.7 }}
        >
          <OrganicLeafSprig size={64} flip />
        </div>
        <div className="tf-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2F7A18', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <FileText size={14} />
            Trading Rules & Governance
          </div>
          <h1
            className="tf-heading-font"
            style={{
              margin: '6px 0 0',
              fontSize: 'clamp(34px, 4vw, 46px)',
              lineHeight: 1.04,
              fontWeight: 600,
            }}
          >
            Terms of Trade
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: '16px', color: 'var(--tf-muted)', maxWidth: '580px' }}>
            Clear operating rules governing opening ask pricing, timed buyer bids, quality lab reports, and APMC delivery.
          </p>
        </div>
      </section>

      <section className="tf-container" style={{ paddingTop: '36px' }}>
        <div className="tf-terms-layout">
          <div style={{ display: 'grid', gap: '16px' }}>
            {clauses.map((item) => (
              <article
                key={item.num}
                className="tf-card"
                style={{ padding: '22px', display: 'grid', gap: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className="tf-tabular"
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--tf-bb-green-soft)',
                      color: '#2F7A18',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    CLAUSE {item.num}
                  </span>
                  <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '21px', fontWeight: 600 }}>
                    {item.heading}
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.55, color: 'var(--tf-muted)' }}>
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          <aside className="tf-card" style={{ padding: '24px', display: 'grid', gap: '14px', alignContent: 'space-between', alignSelf: 'stretch' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2F7A18', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                <Leaf size={14} />
                Buyer Compliance Checklist
              </div>
              <div style={{ display: 'grid', gap: '10px', fontSize: '14px', color: 'var(--tf-ink)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="#2F7A18" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Valid mobile phone & delivery address required prior to bidding</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="#2F7A18" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>All rates are quoted per kilogram inclusive of FPO crate packing</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="#2F7A18" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Trader Admin reserves sole right to lock highest bid</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              className="tf-btn tf-btn-bb"
              style={{ marginTop: '6px' }}
            >
              Vendor Sign in / Register
              <ArrowRight size={15} />
            </button>
          </aside>
        </div>

        <style>{`
          .tf-terms-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 28px;
          }
          @media (min-width: 900px) {
            .tf-terms-layout {
              grid-template-columns: 1.4fr 0.85fr;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
