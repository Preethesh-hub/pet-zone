import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Syringe, Scale, Stethoscope, Folder, Plus, ShoppingBag, Trash2, Store } from 'lucide-react';
import FoodRecommendations from '../components/FoodRecommendations';
import SellPetModal from '../components/SellPetModal';
import { getPetById, deletePet } from '../services/db';
import './PetProfile.css';

const TABS = [
  { id: 'vaccines', label: 'Vaccines', icon: Syringe },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'symptoms', label: 'Symptoms', icon: Stethoscope },
  { id: 'documents', label: 'Documents', icon: Folder },
  { id: 'diet', label: 'Food & Diet', icon: ShoppingBag },
];

export default function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vaccines');
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  useEffect(() => {
    async function loadPet() {
      try {
        const petData = await getPetById(id);
        setPet(petData);
      } catch (error) {
        console.error("Failed to load pet", error);
        alert("Pet not found!");
        navigate('/dashboard');
      }
      setLoading(false);
    }
    loadPet();
  }, [id, navigate]);

  if (loading || !pet) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>;
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${pet.name}'s profile? This cannot be undone.`)) {
      try {
        await deletePet(pet.id);
        navigate('/dashboard');
      } catch (error) {
        console.error("Failed to delete pet", error);
        alert("Failed to delete pet.");
      }
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary icon-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <span className="header-title">{pet.name}'s Profile</span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsSellModalOpen(true)}
            style={{ color: '#10b981', borderColor: '#d1fae5', background: '#ecfdf5' }}
            title="Sell Pet"
          >
            <Store size={16} />
            <span>Sell</span>
          </button>
          
          <button 
            className="btn btn-primary btn-sm share-btn"
            onClick={() => navigate(`/qr/${id}`)}
          >
            <Share2 size={16} />
            <span>Public QR</span>
          </button>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleDelete}
            style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
            title="Delete Pet"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <main className="profile-main animate-fade-in">
        {/* Hero Info */}
        <div className="pet-hero glass-panel">
          <img src={pet.image} alt={pet.name} className="pet-hero-image" />
          <div className="pet-hero-details">
            <h1>{pet.name}</h1>
            <p className="hero-breed">{pet.breed}</p>
            <div className="hero-stats">
              <div className="stat-pill">{pet.type}</div>
              <div className="stat-pill">{pet.age}</div>
              <div className="stat-pill">{pet.weight}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-content glass-panel delay-100">
          <div className="content-header">
            <h2>{TABS.find(t => t.id === activeTab)?.label} Records</h2>
            <button className="btn btn-secondary btn-sm">
              <Plus size={16} /> Add Record
            </button>
          </div>
          
          {/* Mock Content Based on Tab */}
          <div className="record-list">
            {activeTab === 'vaccines' && (
              <>
                <div className="record-item">
                  <div className="record-info">
                    <h4>Rabies</h4>
                    <p>Administered: Oct 12, 2023</p>
                  </div>
                  <div className="record-status status-good">Valid until Oct 2026</div>
                </div>
                <div className="record-item">
                  <div className="record-info">
                    <h4>Bordetella</h4>
                    <p>Administered: Jan 05, 2024</p>
                  </div>
                  <div className="record-status status-warn">Due Jan 2025</div>
                </div>
              </>
            )}

            {activeTab === 'weight' && (
              <div className="empty-state">
                <Scale size={48} className="text-tertiary" />
                <p>No weight logs yet. Start tracking to monitor health trends.</p>
              </div>
            )}

            {activeTab === 'symptoms' && (
              <div className="empty-state">
                <Stethoscope size={48} className="text-tertiary" />
                <p>No symptoms recorded. Hopefully it stays that way!</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="empty-state">
                <Folder size={48} className="text-tertiary" />
                <p>Upload vet bills, test results, and insurance docs.</p>
              </div>
            )}

            {activeTab === 'diet' && (
              <div className="diet-tab-content" style={{ marginTop: '1rem' }}>
                <FoodRecommendations pet={pet} />
              </div>
            )}
          </div>
        </div>
      </main>

      <SellPetModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)} 
        pet={pet} 
      />
    </div>
  );
}
