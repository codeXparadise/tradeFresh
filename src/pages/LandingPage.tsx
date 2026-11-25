import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { LiveTicker } from '../components/LiveTicker';
import { LotCard } from '../components/LotCard';
import {
  OrganicChiliSticker,
  OrganicLeafSprig,
  OrganicTomatoSticker,
} from '../components/OrganicStickers';
import { useTradeStore } from '../context/TradeStoreContext';
import {
  formatCountdown,
  formatInr,
  formatKg,
  getHighestBidAmount,
  isLotBiddingClosed,
} from '../utils/format';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { lots, siteSettings, nowMs, role } = useTradeStore();

  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const slides =
    siteSettings.heroBannerSlides && siteSettings.heroBannerSlides.length > 0
      ? siteSettings.heroBannerSlides
      : [
          {
            id: 'default-slide',
            tag: 'MORNING MANDI DESK · LIVE',
            headline: siteSettings.heroHeadline,
            subheadline: siteSettings.heroSubheadline,
            imageUrl: siteSettings.heroImageUrl || '/images/hero-bigbasket.jpg',
          },
        ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[slideIdx % slides.length];

  const categories = siteSettings.categories ?? [];

  const displayLots = useMemo(() => {
    const featured = lots.filter((l) => l.featuredOnHome);
    const pool = featured.length > 0 ? featured : lots;
    if (selectedCat === 'All') return pool.slice(0, 6);
    return lots
      .filter((l) => l.produce.toLowerCase() === selectedCat.toLowerCase())
      .slice(0, 6);
  }, [lots, selectedCat]);

  const openLots = lots.filter((l) => !isLotBiddingClosed(l, nowMs));
  const totalOpenBids = openLots.reduce((sum, l) => sum + l.bids.length, 0);
  const leadLot = openLots[0] ?? lots[0];

  return (
    <div>
      {siteSettings.announcementText ? (
        <div
          style={{
            backgroundColor: '#1F4E2B',
            color: '#F7FAF5',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 500,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Leaf size={14} color="#82CC6C" />
          <span>{siteSettings.announcementText}</span>
        </div>
      ) : null}

      <LiveTicker
        lots={lots}
        onSelectLot={(id) => onNavigate(role === 'guest' ? '/auth' : `/lots/${id}`)}
      />

      {/* 1. Full-Width BigBasket-Style Organic Banner Hero */}
      <section
        aria-label="Featured harvest banner"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '470px',
          overflow: 'hidden',
          borderBottom: '1px solid var(--tf-border)',
          display: 'grid',
          alignItems: 'center',
        }}
      >
        <img
          src={activeSlide.imageUrl}
          alt={activeSlide.headline}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center right',
            transition: 'opacity 360ms ease',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 34, 21, 0.72)',
          }}
        />

        <div
          className="tf-container"
          style={{ position: 'relative', zIndex: 2, paddingBlock: '52px' }}
        >
          <div className="tf-bb-hero-grid">
            <div style={{ display: 'grid', gap: '18px', maxWidth: '600px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifySelf: 'start',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(94, 158, 49, 0.25)',
                  border: '1px solid rgba(130, 204, 108, 0.5)',
                  color: '#DFF5D5',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <Sparkles size={13} />
                {activeSlide.tag}
              </div>

              <h1
                className="tf-heading-font"
                style={{
                  margin: 0,
                  fontSize: 'clamp(36px, 4.8vw, 60px)',
                  lineHeight: 0.98,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                {slideIdx === 0 ? siteSettings.heroHeadline : activeSlide.headline}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: '17px',
                  lineHeight: 1.5,
                  color: '#E3ECE0',
                  maxWidth: '520px',
                }}
              >
                {slideIdx === 0 ? siteSettings.heroSubheadline : activeSlide.subheadline}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate(role === 'guest' ? '/auth' : '/lots')}
                  className="tf-btn tf-btn-bb"
                  style={{ minHeight: '48px', paddingInline: '22px', fontSize: '15px' }}
                >
                  {siteSettings.heroCtaPrimary || 'Browse live lots'}
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(role === 'admin' ? '/admin' : '/admin-login')
                  }
                  className="tf-btn"
                  style={{
                    minHeight: '48px',
                    paddingInline: '18px',
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <ShieldCheck size={16} />
                  Admin Desk
                </button>
              </div>

              {/* Banner Slide Dots */}
              {slides.length > 1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
                  <button
                    type="button"
                    aria-label="Previous banner"
                    onClick={() =>
                      setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length)
                    }
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      color: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {slides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Show slide ${idx + 1}`}
                      onClick={() => setSlideIdx(idx)}
                      style={{
                        width: idx === slideIdx ? '26px' : '9px',
                        height: '9px',
                        borderRadius: '999px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor:
                          idx === slideIdx ? '#82CC6C' : 'rgba(255,255,255,0.45)',
                        transition: 'width 240ms ease, background-color 200ms ease',
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    aria-label="Next banner"
                    onClick={() => setSlideIdx((prev) => (prev + 1) % slides.length)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      color: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Live Highlight Card inside Full-Width Banner */}
            {leadLot ? (
              <div
                className="tf-card tf-fade-up"
                style={{
                  padding: '20px',
                  maxWidth: '370px',
                  justifySelf: 'end',
                  width: '100%',
                  display: 'grid',
                  gap: '12px',
                  position: 'relative',
                }}
              >

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: isLotBiddingClosed(leadLot, nowMs) ? '#B8321A' : '#2F7A18' }}>
                  {!isLotBiddingClosed(leadLot, nowMs) ? (
                    <span className="tf-live-dot" aria-hidden="true" />
                  ) : null}
                  {isLotBiddingClosed(leadLot, nowMs)
                    ? 'RECENT MANDI BENCHMARK'
                    : 'ACTIVE BID SPOTLIGHT'}
                </span>
                <span
                  className="tf-tabular"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isLotBiddingClosed(leadLot, nowMs) ? '#B8321A' : 'var(--tf-ink)',
                  }}
                >
                  {isLotBiddingClosed(leadLot, nowMs)
                    ? 'Bidding Closed'
                    : formatCountdown(leadLot.endsAt, nowMs)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={leadLot.imageUrl}
                  alt={leadLot.produce}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>
                    {leadLot.title || leadLot.produce}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--tf-muted)' }}>
                    {leadLot.origin} · {formatKg(leadLot.quantityKg)} · {leadLot.grade}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--tf-bg)',
                }}
              >
                <div>
                  <div className="tf-label">Trader Ask</div>
                  <div className="tf-tabular" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatInr(leadLot.askPricePerKg)}/kg
                  </div>
                </div>
                <div>
                  <div className="tf-label" style={{ color: '#2F7A18' }}>Top Bid</div>
                  <div className="tf-tabular" style={{ fontSize: '18px', fontWeight: 700, color: '#2F7A18' }}>
                    {getHighestBidAmount(leadLot) > 0
                      ? `${formatInr(getHighestBidAmount(leadLot))}/kg`
                      : 'Open'}
                  </div>
                </div>
              </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate(role === 'guest' ? '/auth' : `/lots/${leadLot.id}`)
                  }
                  className="tf-btn tf-btn-primary"
                  style={{ width: '100%' }}
                >
                  {role === 'guest' ? 'Sign in to Bid' : 'Open Bid Bench'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. BigBasket-Style Fresh Produce Category Shelf */}
      <section className="tf-container" style={{ paddingBlock: '40px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <OrganicLeafSprig size={34} />
            <div>
              <span className="tf-label" style={{ color: '#2F7A18' }}>
                Shop By Harvest Basket
              </span>
              <h2 className="tf-heading-font" style={{ margin: '2px 0 0', fontSize: '28px', fontWeight: 600 }}>
                Fresh categories on desk today
              </h2>
            </div>
          </div>

          <span className="tf-tabular" style={{ fontSize: '14px', color: 'var(--tf-muted)' }}>
            {openLots.length} open lots · {totalOpenBids} live bids placed
          </span>
        </div>

        <div className="tf-bb-cat-grid">
          <button
            type="button"
            onClick={() => setSelectedCat('All')}
            className="tf-card tf-card-interactive"
            style={{
              padding: '14px',
              textAlign: 'left',
              cursor: 'pointer',
              borderColor: selectedCat === 'All' ? '#5E9E31' : 'var(--tf-border)',
              backgroundColor:
                selectedCat === 'All' ? 'var(--tf-bb-green-soft)' : 'var(--tf-surface)',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--tf-ink)' }}>
              All Harvest Lots
            </div>
            <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
              {lots.length} active & settled lots
            </div>
          </button>

          {categories.map((cat) => {
            const active = selectedCat.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.name)}
                className="tf-card tf-card-interactive"
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: active ? '#5E9E31' : 'var(--tf-border)',
                  backgroundColor: active
                    ? 'var(--tf-bb-green-soft)'
                    : 'var(--tf-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <img
                  src={cat.imageUrl || '/images/produce-tomato.jpg'}
                  alt={cat.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--tf-ink)' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
                    {cat.allowSubcategories && cat.subcategories.length > 0
                      ? `${cat.subcategories.length} varieties`
                      : 'Direct mandi grade'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Live Produce Cards Grid (with Bidding Closed Expiry Badges) */}
      <section className="tf-container" style={{ paddingBottom: '56px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div>
            <span className="tf-label" style={{ color: '#2F7A18' }}>
              Verified Wholesale Lots
            </span>
            <h2 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '30px', fontWeight: 600 }}>
              {selectedCat === 'All' ? 'Today’s Mandi Arrivals' : `${selectedCat} Arrivals`}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(role === 'guest' ? '/auth' : '/lots')}
            className="tf-btn tf-btn-secondary"
          >
            View full lot board
            <ArrowRight size={15} />
          </button>
        </div>

        {displayLots.length === 0 ? (
          <div className="tf-card" style={{ padding: '28px', textAlign: 'center', color: 'var(--tf-muted)' }}>
            No lots listed under {selectedCat} right now. Select All Harvest Lots above.
          </div>
        ) : (
          <div className="tf-bb-lots-grid">
            {displayLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                nowMs={nowMs}
                onOpen={(id) => onNavigate(role === 'guest' ? '/auth' : `/lots/${id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Asymmetric Organic Trust Band (BigBasket Quality Promise + Organic Studio Asset) */}
      <section
        style={{
          backgroundColor: '#1F4E2B',
          color: '#F7FAF5',
          paddingBlock: '56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="tf-container tf-bb-trust-grid">
          <div style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#A5E38A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <OrganicChiliSticker size={28} />
              Farm-to-Mandi Freshness Promise
            </div>
            <h2
              className="tf-heading-font"
              style={{
                margin: 0,
                fontSize: 'clamp(30px, 3.6vw, 44px)',
                lineHeight: 1.06,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Daylight graded. Bid-settled. Gate delivered.
            </h2>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: '#D7E7D4', maxWidth: '520px' }}>
              Trade Fresh removes opaque mandi brokerage. Farmers bring morning crates to our inspection table, we publish the reserve ask price and moisture spec, and verified buyers compete fairly before cold-chain dispatch.
            </p>

            <div className="tf-bb-pillars-mini">
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)' }}>
                <Clock size={18} color="#A5E38A" />
                <div style={{ fontWeight: 700, marginTop: '8px', color: '#FFFFFF' }}>Timed Windows</div>
                <div style={{ fontSize: '13px', color: '#D7E7D4', marginTop: '2px' }}>Clear countdowns auto-close expired bids</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)' }}>
                <ShieldCheck size={18} color="#A5E38A" />
                <div style={{ fontWeight: 700, marginTop: '8px', color: '#FFFFFF' }}>Lab Moisture QC</div>
                <div style={{ fontSize: '13px', color: '#D7E7D4', marginTop: '2px' }}>Custom grades checked prior to lock</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)' }}>
                <Truck size={18} color="#A5E38A" />
                <div style={{ fontWeight: 700, marginTop: '8px', color: '#FFFFFF' }}>Same-Day Reefer</div>
                <div style={{ fontSize: '13px', color: '#D7E7D4', marginTop: '2px' }}>Live GPS carrier tracking to bay</div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              color: '#1A1C19',
              display: 'grid',
              gap: '12px',
              alignSelf: 'center',
            }}
          >
            <img
              src="/images/organic-corner-badge.jpg"
              alt="Fresh heirloom tomatoes, basil, ginger, green chilies, and baby spinach"
              style={{
                width: '100%',
                height: '240px',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderTop: '1px solid #E5E8E2', paddingTop: '12px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1A1C19' }}>
                  Ready to join morning auctions?
                </div>
                <div style={{ fontSize: '13px', color: '#565B53' }}>
                  Instant vendor onboarding · Role-verified access
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/auth')}
                className="tf-btn tf-btn-bb"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .tf-bb-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: center;
        }
        .tf-bb-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 12px;
        }
        .tf-bb-lots-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        .tf-bb-trust-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .tf-bb-pillars-mini {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
        @media (min-width: 720px) {
          .tf-bb-lots-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .tf-bb-hero-grid {
            grid-template-columns: 1.35fr 0.95fr;
          }
          .tf-bb-lots-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .tf-bb-trust-grid {
            grid-template-columns: 1.25fr 0.9fr;
          }
        }
      `}</style>
    </div>
  );
}
