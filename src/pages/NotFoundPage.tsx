import { ArrowLeft, Home, Search } from 'lucide-react';
import { OrganicLeafSprig } from '../components/OrganicStickers';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'grid',
        placeItems: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{ position: 'absolute', top: '40px', left: '6%', opacity: 0.75 }}
      >
        <OrganicLeafSprig size={76} />
      </div>
      <div
        aria-hidden="true"
        style={{ position: 'absolute', bottom: '40px', right: '6%', opacity: 0.75 }}
      >
        <OrganicLeafSprig size={76} flip />
      </div>

      <div
        className="tf-card tf-fade-up"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '36px 28px',
          textAlign: 'center',
          display: 'grid',
          gap: '14px',
        }}
      >
        {/* Crisp animated vector crate scene */}
        <div style={{ width: '176px', height: '160px', margin: '0 auto', display: 'grid', placeItems: 'center' }}>
          <svg
            width="168"
            height="154"
            viewBox="0 0 180 160"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="90"
              cy="86"
              r="60"
              stroke="#2F7A18"
              strokeOpacity="0.24"
              strokeWidth="3"
              strokeDasharray="10 8"
              className="tf-anim-orbit"
            />
            <g className="tf-anim-float">
              <rect
                x="44"
                y="62"
                width="92"
                height="58"
                rx="10"
                fill="#1F4E2B"
                stroke="#2F7A18"
                strokeWidth="3"
              />
              <line x1="44" y1="82" x2="136" y2="82" stroke="#82CC6C" strokeWidth="2.5" strokeOpacity="0.55" />
              <line x1="44" y1="100" x2="136" y2="100" stroke="#82CC6C" strokeWidth="2.5" strokeOpacity="0.55" />
              <path
                d="M72 48C74 34 86 24 104 22C102 38 89 47 72 48Z"
                fill="#2F7A18"
              />
              <circle cx="114" cy="48" r="11" fill="#D33F24" />
              <text
                x="90"
                y="95"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="18"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
              >
                404
              </text>
            </g>
          </svg>
        </div>

        <span className="tf-label" style={{ color: '#2F7A18' }}>
          404 · Crate Not Found
        </span>
        <h1 className="tf-heading-font" style={{ margin: 0, fontSize: '32px', fontWeight: 600 }}>
          Route not found.
        </h1>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--tf-muted)' }}>
          The lot or page URL may have moved, expired, or been mistyped. Return to the main mandi desk to continue bidding.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="tf-btn tf-btn-bb"
          >
            <Home size={16} />
            Go to Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/auth')}
            className="tf-btn tf-btn-secondary"
          >
            <Search size={16} />
            Vendor Sign in
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="tf-btn tf-btn-ghost"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
}
