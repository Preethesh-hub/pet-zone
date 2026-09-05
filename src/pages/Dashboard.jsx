import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Settings, LogOut, PawPrint, MapPin, Store, MessageSquare, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPets } from '../services/db';
import AddPetModal from '../components/AddPetModal';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isPremium, logout } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(false);

  useEffect(() => {
    async function loadPets() {
      if (currentUser) {
        try {
          const userPets = await getUserPets(currentUser.uid);
          setPets(userPets);
        } catch (error) {
          console.error("Failed to load pets");
        }
      }
      setLoading(false);
    }
    loadPets();
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upgraded') === 'true') {
      setShowUpgradedBanner(true);
      // Remove the query param from URL cleanly
      navigate('/dashboard', { replace: true });
      // Auto-hide after 6 seconds
      setTimeout(() => setShowUpgradedBanner(false), 3000);
    }
  }, [location.search]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar / Topbar */}
      <header className="dashboard-header glass-panel">
        <div className="brand">
          <PawPrint size={24} className="text-primary" />
          <h1 className="header-title">PetZone Dashboard</h1>
        </div>
        
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isPremium && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: '0.4rem 1rem', borderRadius: '24px', marginRight: '0.5rem',
              boxShadow: '0 0 12px rgba(251, 191, 36, 0.5)',
              animation: 'pulse 2s infinite'
            }}>
              <Crown size={16} style={{ color: '#78350f', fill: '#fef3c7' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#78350f', letterSpacing: '0.05em' }}>PRO</span>
            </div>
          )}
          
          <button className="btn btn-secondary icon-btn" onClick={() => navigate('/settings')} title="Settings">
            <Settings size={18} />
          </button>
          <button className="btn btn-secondary icon-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="dashboard-main animate-fade-in">

        {/* Full-Screen Payment Success Overlay */}
        {showUpgradedBanner && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              animation: 'popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 0 0 16px rgba(16,185,129,0.15)'
              }}>
                <span style={{ fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>✓</span>
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                Payment Successful!
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                You are now a <strong>PetZone PRO</strong> member.<br/>
                Enjoy unlimited pets, listings and featured placement.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                padding: '0.6rem 1.5rem', borderRadius: '24px',
                boxShadow: '0 0 20px rgba(251,191,36,0.5)',
                marginBottom: '2rem'
              }}>
                <Crown size={20} style={{ color: '#78350f', fill: '#fef3c7' }} />
                <span style={{ fontWeight: '800', color: '#78350f', fontSize: '1rem', letterSpacing: '0.05em' }}>PRO MEMBER</span>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Redirecting to your dashboard...</div>
            </div>
          </div>
        )}

        <div className="dashboard-top">
          <div>
            <h1 className="greeting">Hello, {currentUser?.displayName || currentUser?.email?.split('@')[0]}! 👋</h1>
            <p className="subtitle">Here is how your furry friends are doing.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/clinics')}>
              <MapPin size={18} />
              Nearby Clinics
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/marketplace')}>
              <Store size={18} />
              Marketplace
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/messages')}>
              <MessageSquare size={18} />
              My Messages
            </button>
            <button 
              className="btn btn-primary shadow-hover" 
              onClick={() => {
                if (!isPremium && pets.length >= 1) {
                  alert("Free Plan Limit Reached: You can only add 1 pet. Upgrade to Premium in Settings to add unlimited pets!");
                  navigate('/settings');
                } else {
                  setIsModalOpen(true);
                }
              }}
            >
              <Plus size={20} />
              <span>Add Pet</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading pets...
          </div>
        ) : (
          <div className="pets-grid">
          {pets.map((pet, idx) => (
            <div 
              key={pet.id} 
              className="pet-card glass-panel"
              onClick={() => navigate(`/pet/${pet.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="pet-image-container">
                <img src={pet.image} alt={pet.name} className="pet-image" />
                <div className="pet-type-badge">{pet.type}</div>
              </div>
              <div className="pet-info">
                <h2>{pet.name}</h2>
                <p className="pet-breed">{pet.breed}</p>
                <div className="pet-stats">
                  <div className="stat">
                    <span className="stat-label">Age</span>
                    <span className="stat-value">{pet.age}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Weight</span>
                    <span className="stat-value">{pet.weight}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Card */}
            <div className="pet-card glass-panel add-pet-card" onClick={() => setIsModalOpen(true)}>
              <div className="add-icon-wrapper">
                <Plus size={40} className="text-tertiary" />
              </div>
              <h3>Add Another Pet</h3>
              <p>Keep track of all your companions.</p>
            </div>
          </div>
        )}
      </main>

      {/* Add Pet Modal */}
      <AddPetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPetAdded={(newPet) => setPets([...pets, newPet])} 
      />
    </div>
  );
}
