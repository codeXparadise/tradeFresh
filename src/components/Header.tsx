import { useState } from 'react';
import { Button } from '@astryxdesign/core';
import { Leaf, Menu, ShieldCheck, X } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';
import { ThemeSliderToggle } from './ThemeSliderToggle';

interface HeaderProps {
  route: string;
  onNavigate: (path: string) => void;
}

export function Header({ route, onNavigate }: HeaderProps) {
  const { role, theme, toggleTheme } = useTradeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ label: string; path: string }> = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Terms', path: '/terms' },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  const dashboardPath = role === 'admin' ? '/admin' : '/dashboard';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--tf-surface)',
        borderBottom: '1px solid var(--tf-border)',
        transition: 'background-color 260ms ease, border-color 260ms ease',
      }}
    >
      <div
        className="tf-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          minHeight: '66px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            type="button"
            onClick={() => handleNav('/')}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 0',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              color: 'var(--tf-ink)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                color: '#2F7A18',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Leaf size={22} strokeWidth={2.2} />
            </span>
            <span
              className="tf-heading-font"
              style={{
                fontSize: '21px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Trade Fresh
            </span>
          </button>

          <nav
            aria-label="Primary"
            className="tf-desktop-nav"
            style={{ display: 'none', alignItems: 'center', gap: '4px' }}
          >
            {navItems.map((item) => {
              const active = route === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className="tf-btn tf-btn-ghost"
                  style={{
                    paddingInline: '14px',
                    backgroundColor: active
                      ? 'var(--tf-bb-green-soft)'
                      : 'transparent',
                    color: active ? 'var(--tf-primary)' : 'var(--tf-ink)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div
          className="tf-desktop-actions"
          style={{ display: 'none', alignItems: 'center', gap: '10px' }}
        >
          <ThemeSliderToggle theme={theme} onToggle={toggleTheme} />

          {role !== 'guest' ? (
            <Button
              label={role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
              variant="primary"
              size="lg"
              className="tf-astryx-btn"
              onClick={() => handleNav(dashboardPath)}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNav('/admin-login')}
                className="tf-btn tf-btn-secondary"
              >
                <ShieldCheck size={16} strokeWidth={2} />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleNav('/auth')}
                className="tf-btn tf-btn-bb"
              >
                Sign in / Register
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="tf-btn tf-btn-secondary tf-mobile-menu-btn"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{ paddingInline: '12px' }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="tf-fade-up"
          style={{
            borderTop: '1px solid var(--tf-border)',
            backgroundColor: 'var(--tf-surface)',
            padding: '16px',
            display: 'grid',
            gap: '8px',
          }}
        >
          {navItems.map((item) => {
            const active = route === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`tf-btn ${active ? 'tf-btn-primary' : 'tf-btn-ghost'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                {item.label}
              </button>
            );
          })}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 4px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Appearance</span>
            <ThemeSliderToggle theme={theme} onToggle={toggleTheme} />
          </div>

          {role !== 'guest' ? (
            <button
              type="button"
              onClick={() => handleNav(dashboardPath)}
              className="tf-btn tf-btn-bb"
            >
              {role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </button>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleNav('/admin-login')}
                className="tf-btn tf-btn-secondary"
              >
                <ShieldCheck size={16} />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleNav('/auth')}
                className="tf-btn tf-btn-bb"
              >
                Sign in / Register
              </button>
            </div>
          )}
        </div>
      ) : null}

      <style>{`
        @media (min-width: 900px) {
          .tf-desktop-nav, .tf-desktop-actions {
            display: inline-flex !important;
          }
          .tf-mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
