import { useState } from 'react';
import { Button } from '@astryxdesign/core';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
  const { signInWithCredentials, isSyncing, isSupabaseMode } = useTradeStore();

  const [email, setEmail] = useState(
    isSupabaseMode ? '' : 'trader@tradefresh.in'
  );
  const [password, setPassword] = useState(isSupabaseMode ? '' : 'admin1234');
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      triggerError('Enter a valid administrator email.');
      return;
    }
    if (password.length < 6) {
      triggerError('Invalid password length.');
      return;
    }

    const res = await signInWithCredentials(email, password, 'admin');
    if (!res.ok) {
      triggerError(res.error || 'Wrong admin password or unauthorized account.');
      return;
    }
    onNavigate('/admin');
  };

  return (
    <section className="tf-container" style={{ paddingBlock: '48px' }}>
      <div
        className="tf-fade-up"
        style={{
          maxWidth: '460px',
          margin: '0 auto',
          display: 'grid',
          gap: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="tf-btn tf-btn-ghost"
          style={{ justifySelf: 'start', paddingLeft: 0 }}
        >
          <ArrowLeft size={16} />
          Back to Trade Fresh
        </button>

        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--tf-sage)',
              color: 'var(--tf-primary)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <ShieldCheck size={14} />
            Trader Operations Only
          </div>
          <h1
            className="tf-heading-font"
            style={{
              margin: '10px 0 0',
              fontSize: '36px',
              lineHeight: 1.08,
              fontWeight: 600,
            }}
          >
            Admin Desk Login
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '15px',
              color: 'var(--tf-muted)',
            }}
          >
            Restricted portal for authorized mandi desk administrators. Public self-registration is disabled.
          </p>
        </div>

        <form
          key={shakeKey}
          onSubmit={handleSubmit}
          className={`tf-card ${error ? 'tf-shake-error' : ''}`}
          style={{ padding: '24px', display: 'grid', gap: '16px' }}
        >
          <div style={{ display: 'grid', gap: '6px' }}>
            <label htmlFor="admin-email" className="tf-label">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@tradefresh.in"
              required
              className={`tf-input ${error ? 'tf-input-error' : ''}`}
            />
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label htmlFor="admin-password" className="tf-label">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className={`tf-input ${error ? 'tf-input-error' : ''}`}
            />
          </div>

          {error ? (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(211, 63, 36, 0.08)',
                border: '1px solid var(--tf-live)',
                fontSize: '13px',
                color: 'var(--tf-live-text)',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            label="Sign in to Admin Desk"
            variant="primary"
            size="lg"
            isLoading={isSyncing}
            className="tf-astryx-btn"
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--tf-border)',
              fontSize: '13px',
              color: 'var(--tf-muted)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <LockKeyhole size={14} />
              Invite-provisioned accounts only
            </span>
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--tf-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Vendor Portal →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
