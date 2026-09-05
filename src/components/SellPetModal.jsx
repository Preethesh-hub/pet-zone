import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addListing } from '../services/db';
import { Store, X } from 'lucide-react';

export default function SellPetModal({ isOpen, onClose, pet }) {
  const { currentUser, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    price: '',
    description: ''
  });

  if (!isOpen || !pet) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addListing(
        pet.id, 
        pet, 
        currentUser.uid, 
        formData.price, 
        formData.description, 
        currentUser.email,
        'selling',
        isPremium
      );
      alert(`Success! ${pet.name} is now listed in the Marketplace.`);
      onClose();
    } catch (err) {
      console.error("Error listing pet", err);
      setError(err.message || "Failed to list pet for sale.");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store className="text-primary" size={24} />
            <h2>List for Sale</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            List <strong>{pet.name}</strong> on the public PetZone marketplace. Buyers will contact you at <strong>{currentUser.email}</strong>.
          </p>

          {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              className="form-control" 
              value={formData.price} 
              onChange={handleChange} 
              placeholder="e.g. 5000"
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description / Reason for selling</label>
            <textarea 
              name="description" 
              className="form-control" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder="e.g. Moving to a new city, looking for a loving home."
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Listing...' : 'List on Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
