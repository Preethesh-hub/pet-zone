import { useState } from 'react';
import { X } from 'lucide-react';
import { addPet } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import './AddPetModal.css';

export default function AddPetModal({ isOpen, onClose, onPetAdded }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    weight: '',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80' // default placeholder
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Automatically set a relevant placeholder image when type changes
    if (name === 'type') {
      let defaultImg = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80'; // dog
      if (value === 'Cat') defaultImg = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80';
      else if (value === 'Bird') defaultImg = 'https://images.unsplash.com/photo-1552728089-5747092f2704?auto=format&fit=crop&w=300&q=80';
      else if (value === 'Other') defaultImg = 'https://images.unsplash.com/photo-1425082661705-1834bfd0999c?auto=format&fit=crop&w=300&q=80'; // rabbit/general
      
      setFormData({ ...formData, type: value, image: defaultImg });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Generate dynamic image based on breed/type using a free generative AI image service
      const searchTerm = formData.breed ? formData.breed.trim().toLowerCase() : formData.type.toLowerCase();
      // Using Pollinations AI to guarantee the exact breed they typed
      const prompt = `A highly detailed, cute photo of a ${searchTerm} pet`;
      const dynamicImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true`;
      
      const petToSave = {
        ...formData,
        image: dynamicImage
      };

      // Add pet to Firestore
      const newPet = await addPet(currentUser.uid, petToSave);
      onPetAdded(newPet);
      onClose();
    } catch (err) {
      console.error("Error adding pet", err);
      setError(err.message || "Failed to add pet. Make sure Firestore is enabled.");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h2>Add a New Pet</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Pet's Name</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Type</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Breed</label>
              <input type="text" name="breed" className="form-control" value={formData.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Age</label>
              <input type="text" name="age" className="form-control" value={formData.age} onChange={handleChange} placeholder="e.g. 3 yrs" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Weight</label>
              <input type="text" name="weight" className="form-control" value={formData.weight} onChange={handleChange} placeholder="e.g. 65 lbs" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary full-width" style={{ marginTop: '1rem' }}>
            {loading ? 'Adding...' : 'Save Pet Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
