import { useEffect, useState } from 'react';
import { Button, TextInput } from '@astryxdesign/core';
import { LogOut, Trash2 } from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isSyncing, updateProfile, signOut, deleteAccount } =
    useTradeStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '');
  const [error, setError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || '');
    setCompanyName(user.companyName || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setCity(user.city || '');
    setGstNumber(user.gstNumber || '');
  }, [user]);

  if (!user) return null;

  const isComplete = Boolean(
    displayName.trim() && phone.trim() && address.trim() && city.trim()
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!displayName.trim() || !companyName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Full name, business name, contact phone, delivery address, and city are mandatory.');
      return;
    }
    const res = await updateProfile({
      displayName: displayName.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      gstNumber: gstNumber.trim(),
    });
    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Type DELETE to permanently close your account.');
      return;
    }
    const res = await deleteAccount();
    if (!res.ok) {
      setDeleteError(res.error || 'Could not delete account.');
      return;
    }
    onNavigate('/');
  };

  return (
    <section className="tf-container" style={{ paddingBlock: '36px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <span className="tf-label">
              {user.role === 'admin' ? 'Admin Profile' : `Vendor Profile · ${user.vendorCode}`}
            </span>
            <h1
              className="tf-heading-font"
              style={{ margin: '4px 0 0', fontSize: '34px', lineHeight: 1.1, fontWeight: 600 }}
            >
              Account & Delivery Profile
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '15px', color: 'var(--tf-muted)' }}>
              Complete your contact details and mandatory mandi delivery address for locked deals.
            </p>
          </div>

          <span
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: isComplete ? 'var(--tf-sage)' : 'var(--tf-amber-bg)',
              color: isComplete ? 'var(--tf-primary)' : 'var(--tf-amber-ink)',
              border: '1px solid var(--tf-border)',
            }}
          >
            {isComplete ? 'Profile complete' : 'Address & contact required'}
          </span>
        </div>

        <form
          onSubmit={handleSave}
          className="tf-card"
          style={{ padding: '24px', display: 'grid', gap: '16px' }}
        >
          <div className="tf-profile-two-col">
            <TextInput
              label="Full name"
              value={displayName}
              onChange={(val) => setDisplayName(val)}
              placeholder="e.g. Vishal Prajapati"
              isRequired
              size="lg"
            />
            <TextInput
              label="Account email"
              value={user.email}
              isReadOnly
              size="lg"
            />
          </div>

          <div className="tf-profile-two-col">
            <TextInput
              label="Business / Mandi name"
              value={companyName}
              onChange={(val) => setCompanyName(val)}
              placeholder="e.g. FreshMart Vashi APMC"
              isRequired
              size="lg"
            />
            <TextInput
              label="Contact phone (Mandatory)"
              type="tel"
              value={phone}
              onChange={(val) => setPhone(val)}
              placeholder="+91 98XXX XXXXX"
              isRequired
              size="lg"
            />
          </div>

          <TextInput
            label="Delivery address / Shop & APMC Bay (Mandatory)"
            value={address}
            onChange={(val) => setAddress(val)}
            placeholder="Shop 18, Vashi APMC Vegetable Market"
            isRequired
            size="lg"
          />

          <div className="tf-profile-two-col">
            <TextInput
              label="City / Market hub (Mandatory)"
              value={city}
              onChange={(val) => setCity(val)}
              placeholder="Navi Mumbai"
              isRequired
              size="lg"
            />
            <TextInput
              label="GSTIN / Mandi License (Optional)"
              value={gstNumber}
              onChange={(val) => setGstNumber(val)}
              placeholder="27AABCU9603R1ZM"
              size="lg"
            />
          </div>

          {error ? (
            <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#B33922', fontWeight: 500 }}>
              {error}
            </p>
          ) : null}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSyncing}
              className="tf-astryx-btn"
              label="Save profile"
            />
            <button
              type="button"
              onClick={() => {
                void signOut();
                onNavigate('/');
              }}
              className="tf-btn tf-btn-secondary"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </form>

        {/* Danger Zone: Delete Account */}
        <div
          className="tf-card"
          style={{
            padding: '20px 24px',
            borderColor: '#E4C3BD',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '19px', fontWeight: 600 }}>
                Delete account
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--tf-muted)' }}>
                Permanently close your Trade Fresh profile and sign out across this device.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="tf-btn tf-btn-secondary"
                style={{ color: '#B33922', borderColor: '#E4C3BD' }}
              >
                <Trash2 size={16} strokeWidth={1.75} />
                Delete account
              </button>
            ) : null}
          </div>

          {showDeleteConfirm ? (
            <form onSubmit={handleDeleteAccount} style={{ display: 'grid', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--tf-border)' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span className="tf-label">Type DELETE to confirm</span>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="tf-input"
                />
              </label>
              {deleteError ? (
                <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#B33922' }}>
                  {deleteError}
                </p>
              ) : null}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="tf-btn"
                  style={{ backgroundColor: '#B33922', color: '#FFFFFF' }}
                >
                  Confirm account deletion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                    setDeleteError(null);
                  }}
                  className="tf-btn tf-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      <style>{`
        .tf-profile-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .tf-profile-two-col {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </section>
  );
}
