import { useState } from 'react';
import { Clock, Leaf, MapPin, Phone, Send } from 'lucide-react';
import { OrganicLeafSprig } from '../components/OrganicStickers';
import { useTradeStore } from '../context/TradeStoreContext';

export function ContactPage() {
  const { submitContactInquiry, isSyncing } = useTradeStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (name.trim().length < 2 || !email.includes('@') || message.trim().length < 8) {
      setError('Enter your full name, valid work email, and a short message.');
      setShakeKey((k) => k + 1);
      return;
    }

    const res = await submitContactInquiry({ name, email, company, message });
    if (!res.ok) {
      setError(res.error || 'Could not submit inquiry.');
      setShakeKey((k) => k + 1);
      return;
    }
    setSent(true);
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
  };

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
          style={{ position: 'absolute', top: '10px', right: '5%', opacity: 0.7 }}
        >
          <OrganicLeafSprig size={64} flip />
        </div>
        <div className="tf-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2F7A18', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Leaf size={14} />
            Contact Mandi Desk
          </div>
          <h1
            className="tf-heading-font"
            style={{
              margin: '6px 0 0',
              fontSize: 'clamp(34px, 4.2vw, 48px)',
              lineHeight: 1.04,
              fontWeight: 600,
            }}
          >
            Speak with our operations team.
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: '16px', color: 'var(--tf-muted)', maxWidth: '580px' }}>
            Onboard as a verified wholesale vendor, schedule farm intake crates, or coordinate cold-chain APMC dispatch.
          </p>
        </div>
      </section>

      <section className="tf-container" style={{ paddingTop: '36px' }}>
        <div className="tf-contact-layout">
          {/* Left column: dispatch hub photo & details */}
          <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
            <div className="tf-card" style={{ overflow: 'hidden' }}>
              <img
                src="/images/contact-hub.jpg"
                alt="Trade Fresh regional produce dispatch bay and cold-chain truck"
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div className="tf-card" style={{ padding: '22px', display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ marginTop: '2px', color: '#5E9E31' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Primary Dispatch Hub</div>
                  <div style={{ fontSize: '14px', color: 'var(--tf-muted)' }}>
                    Plot 18, Vashi APMC Vegetable Market, Navi Mumbai · Nashik Yard Annex
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Phone size={18} style={{ marginTop: '2px', color: '#5E9E31' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Trader Desk Line</div>
                  <div className="tf-tabular" style={{ fontSize: '14px', color: 'var(--tf-muted)' }}>
                    +91 98204 51190 · ops@tradefresh.in
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Clock size={18} style={{ marginTop: '2px', color: '#5E9E31' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Auction & Dispatch Hours</div>
                  <div style={{ fontSize: '14px', color: 'var(--tf-muted)' }}>
                    Monday – Sunday · 05:30 AM to 06:00 PM IST
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Inquiry Form with shaking validation */}
          <form
            key={shakeKey}
            onSubmit={handleSubmit}
            className={`tf-card ${error ? 'tf-shake-error' : ''}`}
            style={{ padding: '26px', display: 'grid', gap: '16px', alignSelf: 'start' }}
          >
            <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
              Send a desk inquiry
            </h2>

            <div style={{ display: 'grid', gap: '6px' }}>
              <label htmlFor="c-name" className="tf-label">Your name</label>
              <input
                id="c-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Patel"
                className={`tf-input ${error && name.trim().length < 2 ? 'tf-input-error' : ''}`}
              />
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              <label htmlFor="c-email" className="tf-label">Email address</label>
              <input
                id="c-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@freshmart.in"
                className={`tf-input ${error && !email.includes('@') ? 'tf-input-error' : ''}`}
              />
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              <label htmlFor="c-company" className="tf-label">Company / Mandi Bay</label>
              <input
                id="c-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. FreshMart Wholesale APMC"
                className="tf-input"
              />
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              <label htmlFor="c-msg" className="tf-label">Message</label>
              <textarea
                id="c-msg"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your daily produce requirement, FPO lot volume, or bay code."
                className={`tf-textarea ${error && message.trim().length < 8 ? 'tf-input-error' : ''}`}
              />
            </div>

            {error ? (
              <p role="alert" style={{ margin: 0, fontSize: '13px', color: 'var(--tf-live-text)', fontWeight: 600 }}>
                {error}
              </p>
            ) : null}

            {sent ? (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--tf-bb-green-soft)',
                  color: 'var(--tf-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Inquiry logged cleanly. Our trader team will reach out shortly.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSyncing}
              className="tf-btn tf-btn-bb"
              style={{ justifySelf: 'start' }}
            >
              <Send size={15} />
              Send Message
            </button>
          </form>
        </div>
      </section>

      <style>{`
        .tf-contact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 900px) {
          .tf-contact-layout {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
