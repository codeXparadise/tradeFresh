import { useState } from 'react';
import { Button } from '@astryxdesign/core';
import { ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';

interface AuthPageProps {
  onNavigate: (path: string) => void;
}

export function AuthPage({ onNavigate }: AuthPageProps) {
  const { signInWithCredentials, registerUser, isSyncing, isSupabaseMode } =
    useTradeStore();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState(
    isSupabaseMode ? '' : 'vendor@freshmart.in'
  );
  const [password, setPassword] = useState(isSupabaseMode ? '' : 'demo1234');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
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
      triggerError('Enter a valid work email address.');
      return;
    }
    if (password.length < 6) {
      triggerError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signin') {
      const res = await signInWithCredentials(email, password, 'user');
      if (!res.ok) {
        triggerError(res.error || 'Incorrect email or password.');
        return;
      }
      onNavigate('/dashboard');
      return;
    }

    if (fullName.trim().length < 2 || companyName.trim().length < 2) {
      triggerError('Enter your full name and business / APMC mandi name.');
      return;
    }

    const res = await registerUser({
      email,
      password,
      fullName,
      companyName,
    });
    if (!res.ok) {
      triggerError(res.error || 'Registration failed.');
      return;
    }
    onNavigate('/dashboard');
  };

  return (
    <section className="tf-container" style={{ paddingBlock: '48px' }}>
      <div
        className="tf-fade-up"
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          display: 'grid',
          gap: '20px',
        }}
      >
        <div>
          <span className="tf-label" style={{ color: '#2F7A18' }}>
            Vendor Portal · {isSupabaseMode ? 'Supabase Auth' : 'Sandbox Auth'}
          </span>
          <h1
            className="tf-heading-font"
            style={{
              margin: '6px 0 0',
              fontSize: '36px',
              lineHeight: 1.08,
              fontWeight: 600,
            }}
          >
            {mode === 'signin'
              ? 'Vendor Sign In'
              : 'Register Wholesale Buyer'}
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '15px',
              color: 'var(--tf-muted)',
            }}
          >
            Sign in or register a wholesale buyer account to place live bids on fresh mandi lots.
          </p>
        </div>

        <form
          key={shakeKey}
          onSubmit={handleSubmit}
          className={`tf-card ${error ? 'tf-shake-error' : ''}`}
          style={{ padding: '24px', display: 'grid', gap: '16px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              padding: '4px',
              borderRadius: 'var(--tf-radius)',
              backgroundColor: 'var(--tf-bg)',
              border: '1px solid var(--tf-border)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              style={{
                minHeight: '38px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor:
                  mode === 'signin' ? 'var(--tf-surface)' : 'transparent',
                color: mode === 'signin' ? 'var(--tf-ink)' : 'var(--tf-muted)',
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setEmail('');
                setPassword('');
              }}
              style={{
                minHeight: '38px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor:
                  mode === 'register' ? 'var(--tf-surface)' : 'transparent',
                color:
                  mode === 'register' ? 'var(--tf-ink)' : 'var(--tf-muted)',
              }}
            >
              <UserPlus size={14} />
              Register
            </button>
          </div>

          {mode === 'register' ? (
            <>
              <div style={{ display: 'grid', gap: '6px' }}>
                <label htmlFor="u-fullname" className="tf-label">
                  Full name
                </label>
                <input
                  id="u-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Mehta"
                  required
                  className={`tf-input ${error && !fullName.trim() ? 'tf-input-error' : ''}`}
                />
              </div>

              <div style={{ display: 'grid', gap: '6px' }}>
                <label htmlFor="u-company" className="tf-label">
                  Business / APMC Mandi Name
                </label>
                <input
                  id="u-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. FreshMart Vashi APMC"
                  required
                  className={`tf-input ${error && !companyName.trim() ? 'tf-input-error' : ''}`}
                />
              </div>
            </>
          ) : null}

          <div style={{ display: 'grid', gap: '6px' }}>
            <label htmlFor="u-email" className="tf-label">
              Work email
            </label>
            <input
              id="u-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="buyer@mandicompany.in"
              required
              className={`tf-input ${error ? 'tf-input-error' : ''}`}
            />
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label htmlFor="u-password" className="tf-label">
              Password
            </label>
            <input
              id="u-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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
            label={
              mode === 'signin'
                ? 'Sign in to Vendor Desk'
                : 'Create Buyer Account'
            }
            variant="primary"
            size="lg"
            isLoading={isSyncing}
            className="tf-astryx-btn"
          />

          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--tf-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--tf-muted)',
            }}
          >
            <span>Are you the Trader Admin?</span>
            <button
              type="button"
              onClick={() => onNavigate('/admin-login')}
              className="tf-btn tf-btn-ghost"
              style={{ minHeight: '34px', paddingInline: '10px', fontSize: '13px' }}
            >
              <ShieldCheck size={14} />
              Open Admin Login
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
