import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, Crown, Check, X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentToken, verifyAndActivatePremium, cancelPremium } from '../services/db';

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser, isPremium, setIsPremium } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const handleCancelPremium = async () => {
    if (window.confirm("Are you sure you want to cancel Premium? You will lose unlimited pets and listings, but you keep what you already have.")) {
      setLoading(true);
      await cancelPremium(currentUser.uid);
      setIsPremium(false);
      setLoading(false);
    }
  };

  const handleOpenUpgradeModal = async () => {
    setVerifyError('');
    setShowUpgradeModal(true);
    // Generate a secure one-time token tied to this user
    try {
      const token = await createPaymentToken(currentUser.uid);
      setPaymentToken(token);
    } catch (err) {
      setVerifyError('Failed to initialize payment. Please try again.');
    }
  };

  const handleActivatePremium = async () => {
    if (!paymentToken) {
      setVerifyError('Payment session expired. Please close and try again.');
      return;
    }
    setLoading(true);
    setVerifyError('');
    try {
      await verifyAndActivatePremium(paymentToken, currentUser.uid);
      setIsPremium(true);
      setLoading(false);
      setShowUpgradeModal(false);
      setPaymentToken(null);
      navigate('/dashboard?upgraded=true');
    } catch (err) {
      setVerifyError(err.message || 'Verification failed. Please contact support.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary icon-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={24} className="text-primary" />
          <h1 style={{ margin: 0 }}>Settings</h1>
        </div>
      </header>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2>Subscription Plan</h2>
        
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1.5rem', 
          border: isPremium ? '2px solid #fbbf24' : '1px solid rgba(0,0,0,0.1)', 
          borderRadius: '12px',
          background: isPremium ? '#fffbeb' : 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {isPremium && (
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#fbbf24', color: '#78350f', padding: '0.25rem 1rem', borderBottomLeftRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              ACTIVE
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: isPremium ? '#fef3c7' : '#f3f4f6', padding: '1rem', borderRadius: '50%' }}>
              <Crown size={32} style={{ color: isPremium ? '#d97706' : '#9ca3af' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: isPremium ? '#92400e' : 'inherit' }}>
                {isPremium ? 'Wellcard Premium' : 'Free Plan'}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {isPremium ? 'You have unlimited access to all features.' : 'Basic access with strict limits.'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isPremium ? '#15803d' : 'var(--text-primary)' }}>
              {isPremium ? <Check size={18}/> : <X size={18} style={{color: 'red'}}/>}
              <span>{isPremium ? 'Unlimited Pets' : 'Maximum 1 Pet'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isPremium ? '#15803d' : 'var(--text-primary)' }}>
              {isPremium ? <Check size={18}/> : <X size={18} style={{color: 'red'}}/>}
              <span>{isPremium ? 'Unlimited Marketplace Listings' : 'Maximum 2 Active Listings'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isPremium ? '#15803d' : 'var(--text-primary)' }}>
              {isPremium ? <Check size={18}/> : <X size={18} style={{color: 'red'}}/>}
              <span>{isPremium ? 'Gold Featured Badge on Listings' : 'Standard Listings'}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            {isPremium ? (
              <button className="btn btn-secondary" onClick={handleCancelPremium} disabled={loading} style={{ borderColor: 'red', color: 'red' }}>
                {loading ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleOpenUpgradeModal} style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>
                Upgrade to Premium (₹149/mo)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h2>Upgrade to Premium</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Scan the QR Code below using any UPI App to pay ₹149/month.
            </p>
            
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ width: '220px', height: '220px', margin: '0 auto', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <img 
                  src="/payment-qr.jpg" 
                  alt="UPI QR Code" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%' }} 
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#374151', marginTop: '0.75rem', fontWeight: '600' }}>
                UPI ID: 8660905497@ybl
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Pay ₹149 · Then click Activate below
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => { setShowUpgradeModal(false); setVerifyError(''); }} style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleActivatePremium} 
                disabled={loading || !paymentToken} 
                style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', fontWeight: 'bold' }}
              >
                {loading ? 'Verifying...' : '✅ I have Paid — Activate PRO'}
              </button>
            </div>
            {verifyError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem', marginBottom: 0 }}>
                ⚠️ {verifyError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
