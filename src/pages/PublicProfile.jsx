import { useParams } from 'react-router-dom';
import { Phone, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import './PublicProfile.css';

export default function PublicProfile() {
  const { id } = useParams();

  // Mock public data (read-only)
  const pet = {
    id,
    name: 'Luna',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '3 yrs',
    weight: '65 lbs',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    owner: {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john@example.com'
    },
    criticalInfo: {
      allergies: 'None',
      medications: 'Heartgard (Monthly)',
      microchip: '981020000394857'
    },
    vaccines: [
      { name: 'Rabies', status: 'Valid', expiry: 'Oct 2026' }
    ]
  };

  return (
    <div className="public-profile-container">
      <div className="public-card animate-fade-in">
        
        {/* Header / Emergency Banner */}
        <div className="emergency-banner">
          <AlertTriangle size={20} />
          <span>Emergency Profile</span>
        </div>

        {/* Pet Info */}
        <div className="public-hero">
          <img src={pet.image} alt={pet.name} className="public-image" />
          <h1>{pet.name}</h1>
          <p className="public-breed">{pet.breed}</p>
          <div className="public-stats">
            <span>{pet.type}</span> • <span>{pet.age}</span> • <span>{pet.weight}</span>
          </div>
        </div>

        {/* Owner Contact */}
        <div className="info-section">
          <h3>Owner Contact</h3>
          <div className="contact-card">
            <p className="owner-name">{pet.owner.name}</p>
            <a href={`tel:${pet.owner.phone}`} className="contact-link">
              <Phone size={16} />
              {pet.owner.phone}
            </a>
            <a href={`mailto:${pet.owner.email}`} className="contact-link">
              <Mail size={16} />
              {pet.owner.email}
            </a>
          </div>
        </div>

        {/* Critical Health Info */}
        <div className="info-section delay-100">
          <h3>Critical Info</h3>
          <ul className="info-list">
            <li><strong>Allergies:</strong> {pet.criticalInfo.allergies}</li>
            <li><strong>Medications:</strong> {pet.criticalInfo.medications}</li>
            <li><strong>Microchip ID:</strong> {pet.criticalInfo.microchip}</li>
          </ul>
        </div>

        {/* Vaccines Verification */}
        <div className="info-section delay-200">
          <h3>Verified Vaccines</h3>
          {pet.vaccines.map((vax, idx) => (
            <div key={idx} className="verified-card">
              <ShieldCheck size={24} className="text-success" />
              <div>
                <h4>{vax.name}</h4>
                <p>Valid until {vax.expiry}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-branding">
          <p>Powered by <strong>PetZone</strong></p>
        </div>
      </div>
    </div>
  );
}
