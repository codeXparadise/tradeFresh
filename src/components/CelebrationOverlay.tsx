import { useEffect } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';

const PARTICLES = [
  { left: '12%', delay: '0s', color: '#2F7A18' },
  { left: '24%', delay: '0.12s', color: '#D33F24' },
  { left: '38%', delay: '0.05s', color: '#82CC6C' },
  { left: '52%', delay: '0.18s', color: '#F59E0B' },
  { left: '66%', delay: '0.08s', color: '#2F7A18' },
  { left: '78%', delay: '0.2s', color: '#D33F24' },
  { left: '89%', delay: '0.04s', color: '#82CC6C' },
];

export function CelebrationOverlay() {
  const { celebrationActive, dismissCelebration, user } = useTradeStore();

  useEffect(() => {
    if (!celebrationActive) return;
    const t = window.setTimeout(() => dismissCelebration(), 4400);
    return () => window.clearTimeout(t);
  }, [celebrationActive, dismissCelebration]);

  if (!celebrationActive) return null;

  return (
    <div
      role="dialog"
      aria-label="Account created welcome celebration"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 95,
        backgroundColor: 'rgba(15, 20, 16, 0.52)',
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
      }}
    >
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
      >
        {PARTICLES.map((p, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              top: '12%',
              left: p.left,
              width: '12px',
              height: '12px',
              borderRadius: idx % 2 === 0 ? '999px' : '2px',
              backgroundColor: p.color,
              animation: `tf-confetti-fall 2.6s ease-out ${p.delay} forwards`,
            }}
          />
        ))}
      </div>

      <div
        className="tf-card tf-fade-up"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '28px',
          textAlign: 'center',
          display: 'grid',
          gap: '12px',
          position: 'relative',
          borderColor: 'var(--tf-bb-green)',
        }}
      >
        <div
          className="tf-anim-float"
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto',
            borderRadius: '999px',
            backgroundColor: '#2F7A18',
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <CheckCircle2 size={38} />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#2F7A18',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <Sparkles size={14} />
          Welcome to Trade Fresh
        </div>

        <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '26px', fontWeight: 600 }}>
          Account Created Successfully
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--tf-muted)' }}>
          {user?.displayName || 'Your buyer desk'} ({user?.vendorCode || 'Verified'}) is live. You can now bid on farm-direct vegetable lots.
        </p>

        <button
          type="button"
          onClick={dismissCelebration}
          className="tf-btn tf-btn-bb"
          style={{ marginTop: '6px' }}
        >
          Start Exploring Lots
        </button>
      </div>
    </div>
  );
}
