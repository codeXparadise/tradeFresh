interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const links = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Terms', path: '/terms' },
    { label: 'Sign in / Register', path: '/auth' },
    { label: 'Admin', path: '/admin-login' },
  ];

  return (
    <footer
      style={{
        marginTop: '64px',
        borderTop: '1px solid var(--tf-border)',
        backgroundColor: 'var(--tf-bg)',
      }}
    >
      <div
        className="tf-container"
        style={{
          paddingBlock: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span
            className="tf-heading-font"
            style={{ fontSize: '20px', fontWeight: 600, color: 'var(--tf-ink)' }}
          >
            Trade Fresh
          </span>
          <span style={{ fontSize: '13px', color: 'var(--tf-muted)' }}>
            B2B farm-to-vendor produce desk
          </span>
        </div>

        <nav
          aria-label="Footer"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '18px' }}
        >
          {links.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 0',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--tf-muted)',
                fontWeight: 500,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
