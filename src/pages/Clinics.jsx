import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Phone, ArrowLeft, Search, Navigation2 } from 'lucide-react';
import './Clinics.css';

export default function Clinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Fetch live veterinary clinics within 10km (10000 meters) using Overpass API
          const query = `[out:json];node(around:10000,${latitude},${longitude})["amenity"="veterinary"];out;`;
          const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const data = await response.json();
          
          if (data.elements) {
            const parsedClinics = data.elements.map(el => ({
              id: el.id,
              name: el.tags?.name || "Veterinary Clinic",
              address: `${el.tags?.['addr:street'] || ''} ${el.tags?.['addr:city'] || ''}`.trim() || "Local Clinic",
              phone: el.tags?.phone || null,
              lat: el.lat,
              lon: el.lon
            }));
            setClinics(parsedClinics);
          }
        } catch (error) {
          console.error("Failed to fetch clinics", error);
          setErrorMsg("Failed to fetch live clinics. Please try again.");
        }
        setLoadingLoc(false);
      },
      (error) => {
        setErrorMsg("Please allow location access to find nearby clinics.");
        setLoadingLoc(false);
      }
    );
  }, []);

  return (
    <div className="clinics-container">
      {/* Header */}
      <header className="dashboard-header glass-panel clinics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary icon-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="header-title" style={{ margin: 0, fontSize: '1.5rem' }}>Nearby Clinics</h1>
        </div>
        <div className="search-bar glass-panel">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search by name or zip..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="clinics-main animate-fade-in">
        {/* Split View */}
        <div className="clinics-layout">
          
          {/* Left: Map Area */}
          <div className="map-section glass-panel">
            {loadingLoc ? (
              <div className="locating-state">
                <Navigation size={40} className="pulse-icon text-primary" />
                <h3>Finding your location...</h3>
                <p>Allow location access to find the nearest vets.</p>
              </div>
            ) : (
              <div className="map-mockup">
                {/* Mock Map Image representing Google Maps */}
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
                  alt="Map view" 
                  className="map-image"
                />
                <div className="map-overlay">
                  <div className="map-pin active-pin">
                    <MapPin size={24} />
                    <span>You are here</span>
                  </div>
                </div>
              </div>
            )}
            {errorMsg && (
              <div style={{ padding: '1rem', color: 'red', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right: Clinic List */}
          <div className="list-section">
            <div className="list-header">
              <h2>Top Rated Near You</h2>
              <p>{clinics.length} clinics found in your area</p>
            </div>

            <div className="clinic-cards">
              {clinics.length === 0 && !loadingLoc && !errorMsg ? (
                <div className="empty-state">No clinics found within 10km.</div>
              ) : (
                clinics.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(clinic => (
                  <div key={clinic.id} className="clinic-card glass-panel">
                    <div className="clinic-info">
                      <h3>{clinic.name}</h3>
                      <p className="clinic-address">
                        <MapPin size={14} /> {clinic.address}
                      </p>
                    </div>
                    <div className="clinic-actions">
                      {clinic.phone && (
                        <a href={`tel:${clinic.phone}`} className="btn btn-secondary call-btn">
                          <Phone size={18} />
                        </a>
                      )}
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary share-btn-small"
                        style={{ textDecoration: 'none' }}
                      >
                        <Navigation2 size={16} /> Directions
                      </a>
                      <button 
                        className="btn btn-secondary share-btn-small"
                        onClick={() => navigate('/appointments')}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
