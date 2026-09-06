import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Syringe, Scale, Stethoscope, Folder, Plus, ShoppingBag, Trash2, Store } from 'lucide-react';
import FoodRecommendations from '../components/FoodRecommendations';
import SellPetModal from '../components/SellPetModal';
import { getPetById, deletePet, getPetRecords, addPetRecord } from '../services/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  // Records state
  const [records, setRecords] = useState({
    vaccines: [],
    weight: [],
    symptoms: []
  });
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ title: '', date: '', notes: '', value: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const petData = await getPetById(id);
        setPet(petData);
        
        // Load records
        const vax = await getPetRecords(id, 'vaccines');
        const wgt = await getPetRecords(id, 'weight');
        const sym = await getPetRecords(id, 'symptoms');
        
        setRecords({
          vaccines: vax,
          // Sort weight by date ascending for chart
          weight: wgt.sort((a,b) => new Date(a.date) - new Date(b.date)),
          symptoms: sym
        });
        
      } catch (error) {
        console.error("Failed to load pet data", error);
        alert("Pet not found!");
        navigate('/dashboard');
      }
      setLoading(false);
    }
    loadData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${pet.name}'s profile? This cannot be undone.`)) {
      try {
        await deletePet(pet.id);
        navigate('/dashboard');
      } catch (error) {
        alert("Failed to delete pet.");
      }
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const added = await addPetRecord(id, activeTab, newRecord);
      
      setRecords(prev => {
        const updated = [...prev[activeTab], added];
        if (activeTab === 'weight') {
          return { ...prev, weight: updated.sort((a,b) => new Date(a.date) - new Date(b.date)) };
        }
        // sort others desc
        return { ...prev, [activeTab]: updated.sort((a,b) => new Date(b.date) - new Date(a.date)) };
      });
      
      setIsAddModalOpen(false);
      setNewRecord({ title: '', date: '', notes: '', value: '' });
    } catch (error) {
      alert("Failed to add record");
    }
    setSubmitting(false);
  };

  if (loading || !pet) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>;
  }

  return (
    <motion.div 
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
        <motion.div 
          className="tab-content glass-panel"
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="content-header">
            <h2>{TABS.find(t => t.id === activeTab)?.label} Records</h2>
            {['vaccines', 'weight', 'symptoms'].includes(activeTab) && (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} /> Add Record
              </button>
            )}
          </div>
          
          <div className="record-list">
            {activeTab === 'vaccines' && (
              <>
                {records.vaccines.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No vaccines logged.</p>
                ) : (
                  records.vaccines.map(rec => (
                    <div key={rec.id} className="record-item">
                      <div className="record-info">
                        <h4>{rec.title}</h4>
                        <p>Date: {rec.date}</p>
                        {rec.notes && <p style={{ fontSize: '0.85rem' }}>{rec.notes}</p>}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'weight' && (
              <>
                {records.weight.length === 0 ? (
                  <div className="empty-state">
                    <Scale size={48} className="text-tertiary" />
                    <p>No weight logs yet. Start tracking to monitor health trends.</p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={records.weight} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {activeTab === 'symptoms' && (
              <>
                {records.symptoms.length === 0 ? (
                  <div className="empty-state">
                    <Stethoscope size={48} className="text-tertiary" />
                    <p>No symptoms recorded. Hopefully it stays that way!</p>
                  </div>
                ) : (
                  records.symptoms.map(rec => (
                    <div key={rec.id} className="record-item" style={{ borderLeft: '4px solid #ef4444' }}>
                      <div className="record-info">
                        <h4>{rec.title}</h4>
                        <p>Noticed on: {rec.date}</p>
                        {rec.notes && <p style={{ fontSize: '0.85rem' }}>{rec.notes}</p>}
                      </div>
                    </div>
                  ))
                )}
              </>
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
        </motion.div>
      </main>

      {/* Add Record Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h2>Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record</h2>
              <form onSubmit={handleAddRecord}>
                
                {activeTab === 'vaccines' && (
                  <div className="form-group">
                    <label>Vaccine Name</label>
                    <input type="text" required value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} />
                  </div>
                )}
                
                {activeTab === 'symptoms' && (
                  <div className="form-group">
                    <label>Symptom</label>
                    <input type="text" required value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} />
                  </div>
                )}
                
                {activeTab === 'weight' && (
                  <div className="form-group">
                    <label>Weight (lbs/kg)</label>
                    <input type="number" step="0.1" required value={newRecord.value} onChange={e => setNewRecord({...newRecord, value: e.target.value})} />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" required value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <input type="text" value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SellPetModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)} 
        pet={pet} 
      />
    </motion.div>
  );
}
