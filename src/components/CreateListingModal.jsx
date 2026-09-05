import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addListing } from '../services/db';
import { Store, X } from 'lucide-react';

export default function CreateListingModal({ isOpen, onClose }) {
  const { currentUser, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'wanted', // wanted or selling
    petType: 'Dog',
    breed: '',
    price: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const searchTerm = formData.breed ? formData.breed.trim().toLowerCase() : formData.petType.toLowerCase();
      const prompt = `A highly detailed, cute photo of a ${searchTerm} pet`;
      const dynamicImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true`;
      
      const petDataMock = {
        name: formData.type === 'wanted' ? 'Wanted Pet' : 'Pet for Sale',
        type: formData.petType,
        breed: formData.breed,
        image: dynamicImage,
        age: 'N/A',
        weight: 'N/A'
      };

      await addListing(
        null, // No specific petId
        petDataMock, 
        currentUser.uid, 
        formData.price, 
        formData.description, 
        currentUser.email,
        formData.type,
        isPremium
      );
      
      alert(`Success! Your listing has been posted.`);
      onClose();
    } catch (err) {
      console.error("Error creating listing", err);
      setError(err.message || "Failed to post listing.");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store className="text-primary" size={24} />
            <h2>Post to Marketplace</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Listing Type</label>
            <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
              <option value="wanted">I am looking to buy (Wanted)</option>
              <option value="selling">I have a pet to sell (Selling)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Animal Type</label>
            <select name="petType" className="form-control" value={formData.petType} onChange={handleChange}>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Breed (Optional)</label>
            <input 
              type="text" 
              name="breed" 
              className="form-control" 
              value={formData.breed} 
              onChange={handleChange} 
              placeholder="e.g. Golden Retriever"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{formData.type === 'wanted' ? 'Budget (₹)' : 'Price (₹)'}</label>
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
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-control" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder={formData.type === 'wanted' ? 'What exactly are you looking for?' : 'Why are you selling?'}
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
