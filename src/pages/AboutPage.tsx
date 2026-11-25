import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Truck } from 'lucide-react';
import {
  OrganicLeafSprig,
  OrganicTomatoSticker,
} from '../components/OrganicStickers';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const pillars = [
    {
      num: '01',
      heading: 'Direct FPO Intake',
      detail:
        'Trade Fresh sources at dawn directly from Nashik, Lasalgaon, Pune, Indore, and Kolar grower collectives without layered brokers.',
    },
    {
      num: '02',
      numStyle: true,
      heading: 'Daylight Quality Bench',
      detail:
        'Moisture percentage, size grading, and defect tolerance are checked on the intake table before setting an opening ask price.',
    },
    {
      num: '03',
      heading: 'Open Timed Bidding',
      detail:
        'Verified wholesale buyers bid transparently within crisp timed windows. Once time closes, no late overrides are allowed.',
    },
    {
      num: '04',
      heading: 'Tracked Cold-Chain Gate',
      detail:
        'Locked lots move through pre-dispatch QC sign-off and reefer logistics directly to your APMC receiving bay.',
    },
  ];

  return (
    <div style={{ paddingBottom: '48px' }}>
      {/* Full-Width Fresh Hero Band */}
      <section
        style={{
          backgroundColor: 'var(--tf-bb-green-soft)',
          borderBottom: '1px solid var(--tf-border)',
          paddingBlock: '52px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{ position: 'absolute', top: '16px', right: '4%', opacity: 0.75 }}
        >
          <OrganicLeafSprig size={72} flip />
        </div>

        <div className="tf-container tf-about-hero">
          <div style={{ display: 'grid', gap: '18px', alignContent: 'start' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2F7A18', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Leaf size={14} />
              About Trade Fresh
            </div>
            <h1
              className="tf-heading-font"
              style={{
                margin: 0,
                fontSize: 'clamp(34px, 4.2vw, 48px)',
                lineHeight: 1.04,
                fontWeight: 600,
              }}
            >
              Agri-trade, settled cleanly.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '17px',
                lineHeight: 1.55,
                color: 'var(--tf-muted)',
              }}
            >
              Built to bring supermarket-grade clarity and instant accountability to Indian vegetable auctions — from grower crate to vendor shelf.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '6px' }}>
              <button
                type="button"
                onClick={() => onNavigate('/auth')}
                className="tf-btn tf-btn-bb"
              >
                Register as Buyer
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="tf-btn tf-btn-secondary"
              >
                Contact Desk
              </button>
            </div>
          </div>

          <div
            className="tf-card"
            style={{ overflow: 'hidden', position: 'relative' }}
          >
            <img
              src="/images/about-yard.jpg"
              alt="Digital weighing scale and produce quality grading yard in India"
              style={{
                width: '100%',
                height: '360px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 33, 21, 0.88)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={15} color="#82CC6C" />
              100% Moisture & Weight Verified Crates
            </div>
          </div>
        </div>
      </section>

      {/* Dark Green Split Value Strip (explicit white heading contrast) */}
      <section
        style={{
          backgroundColor: '#1F4E2B',
          color: '#F7FAF5',
          paddingBlock: '48px',
        }}
      >
        <div className="tf-container tf-about-band">
          <div style={{ display: 'grid', gap: '10px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A5E38A', fontWeight: 700 }}>
              Desk Discipline
            </span>
            <h2
              className="tf-heading-font"
              style={{
                margin: 0,
                fontSize: 'clamp(26px, 3vw, 34px)',
                lineHeight: 1.12,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Transparent ask prices. Competitive buyer bids.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <div className="tf-heading-font tf-tabular" style={{ fontSize: '34px', fontWeight: 600, color: '#FFFFFF' }}>
                5+ Hubs
              </div>
              <div style={{ fontSize: '13px', color: '#D7E7D4' }}>
                Direct FPO intake centers across MH, MP & KA
              </div>
            </div>
            <div>
              <div className="tf-heading-font tf-tabular" style={{ fontSize: '34px', fontWeight: 600, color: '#FFFFFF' }}>
                4 Stages
              </div>
              <div style={{ fontSize: '13px', color: '#D7E7D4' }}>
                Lock, QC bench, reefer dispatch & gate receipt
              </div>
            </div>
            <div>
              <div className="tf-heading-font tf-tabular" style={{ fontSize: '34px', fontWeight: 600, color: '#FFFFFF' }}>
                Zero Fees
              </div>
              <div style={{ fontSize: '13px', color: '#D7E7D4' }}>
                Direct per-kg price clarity with no hidden cuts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Grid Pillars + Organic Illustration Card */}
      <section className="tf-container" style={{ paddingTop: '48px' }}>
        <div className="tf-about-pillars-layout">
          <div className="tf-pillars-grid">
            {pillars.map((item) => (
              <div key={item.heading} className="tf-card" style={{ padding: '22px', display: 'grid', gap: '8px' }}>
                <span className="tf-tabular" style={{ fontSize: '12px', fontWeight: 700, color: '#5E9E31' }}>
                  STEP {item.num}
                </span>
                <h3 className="tf-heading-font" style={{ margin: 0, fontSize: '21px', fontWeight: 600 }}>
                  {item.heading}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: 'var(--tf-muted)' }}>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <aside
            className="tf-card"
            style={{
              padding: '24px',
              display: 'grid',
              gap: '14px',
              alignContent: 'start',
              backgroundColor: '#FFFFFF',
              color: '#1A1C19',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5E9E31', textTransform: 'uppercase' }}>
                Fresh Assurance
              </span>
              <OrganicTomatoSticker size={32} />
            </div>
            <img
              src="/images/organic-corner-badge.jpg"
              alt="Fresh heirloom tomatoes, basil, ginger and green chilies"
              style={{ width: '100%', height: '200px', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: '#464B43' }}>
              <ShieldCheck size={18} color="#5E9E31" />
              <span>Custom trader grades verified daily</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: '#464B43' }}>
              <Truck size={18} color="#5E9E31" />
              <span>Insulated crates dispatched same morning</span>
            </div>
          </aside>
        </div>
      </section>

      <style>{`
        .tf-about-hero,
        .tf-about-band,
        .tf-about-pillars-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: center;
        }
        .tf-pillars-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 720px) {
          .tf-pillars-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 960px) {
          .tf-about-hero {
            grid-template-columns: 1fr 1.15fr;
          }
          .tf-about-band {
            grid-template-columns: 0.9fr 1.2fr;
          }
          .tf-about-pillars-layout {
            grid-template-columns: 1.5fr 0.85fr;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
