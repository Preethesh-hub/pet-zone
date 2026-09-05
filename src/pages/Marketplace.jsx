import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, Search, MessageSquare, MapPin, Plus, CheckCircle, Flag, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getListings, getOrCreateChat, markListingSold, reportListing } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import CreateListingModal from '../components/CreateListingModal';
import './Marketplace.css';

export default function Marketplace() {
  const navigate = useNavigate();
  const { currentUser, isPremium } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await getListings();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      }
      setLoading(false);
    }
    fetchListings();
  }, [isModalOpen]); // refetch when modal closes

  // Sort listings: Featured first, then newest
  const sortedListings = [...listings].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
  });

  const filteredListings = filter === 'All' 
    ? sortedListings 
    : sortedListings.filter(l => l.petData.type === filter);

  const handleMessage = async (listing) => {
    try {
      const chatId = await getOrCreateChat(listing.id, currentUser.uid, listing.sellerId, listing);
      navigate(`/messages/${chatId}`);
    } catch (err) {
      alert("Failed to start chat.");
    }
  };

  const handleMarkSold = async (listingId) => {
    if (window.confirm("Mark this listing as Sold/Closed? It will be removed from the marketplace.")) {
      await markListingSold(listingId);
      setListings(listings.filter(l => l.id !== listingId));
    }
  };

  const handleReport = async (listingId) => {
    const reason = window.prompt("Why are you reporting this listing? (e.g. Spam, inappropriate, scam)");
    if (reason && reason.trim() !== "") {
      try {
        await reportListing(listingId, currentUser.uid, reason);
        alert("Thank you. This listing has been reported to the moderators.");
      } catch (err) {
        alert("Failed to report listing. Please try again.");
      }
    }
  };

  return (
    <div className="marketplace-container">
      <header className="marketplace-header glass-panel">
        <button className="btn btn-secondary icon-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={24} className="text-primary" />
          <h1 className="header-title">Pet Marketplace</h1>
        </div>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => {
            const activeUserListings = listings.filter(l => l.sellerId === currentUser?.uid);
            if (!isPremium && activeUserListings.length >= 2) {
              alert("Free Plan Limit Reached: You can only have 2 active listings. Upgrade to Premium in Settings for unlimited listings!");
              navigate('/settings');
            } else {
              setIsModalOpen(true);
            }
          }}
        >
          <Plus size={16} />
          <span>Post Listing</span>
        </button>
      </header>

      <main className="marketplace-main animate-fade-in">
        
        {/* Safety Banner */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ShieldAlert size={24} style={{ color: '#16a34a' }} />
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: '1.4' }}>
            <strong>Community Safety Guidelines:</strong> Meet in public places for exchanges. Never send money in advance. Report suspicious listings immediately using the red flag icon.
          </p>
        </div>

        {/* Filters */}
        <div className="filters-container glass-panel delay-100">
          <div className="search-bar">
            <Search size={18} className="text-secondary" />
            <input type="text" placeholder="Search pets (coming soon...)" disabled />
          </div>
          <div className="filter-chips">
            {['All', 'Dog', 'Cat', 'Bird', 'Other'].map(type => (
              <button 
                key={type}
                className={`filter-chip ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="listings-grid delay-200">
          {loading ? (
            <div className="loading-state">Loading marketplace...</div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state glass-panel">
              <Store size={48} className="text-tertiary" />
              <h2>No Pets Found</h2>
              <p>There are currently no {filter !== 'All' ? filter + 's' : 'pets'} listed for sale.</p>
            </div>
          ) : (
            filteredListings.map(listing => (
              <div key={listing.id} className={`listing-card glass-panel shadow-hover ${listing.type === 'wanted' ? 'wanted-card' : ''}`}>
                <div className="listing-image-container">
                  <img src={listing.petData.image} alt={listing.petData.name} className="listing-image" />
                  <div className="listing-price badge-primary">
                    {listing.type === 'wanted' ? 'Budget: ' : ''}₹{listing.price}
                  </div>
                  {listing.isFeatured && (
                    <div className="listing-badge" style={{
                      position: 'absolute', top: '1rem', right: '1rem', 
                      background: '#fbbf24', color: '#78350f', padding: '0.25rem 0.75rem', borderRadius: '12px',
                      fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}>
                      ★ Featured
                    </div>
                  )}
                  <div className="listing-badge" style={{
                    position: 'absolute', top: '1rem', left: '1rem', 
                    background: listing.type === 'wanted' ? '#f59e0b' : '#10b981',
                    color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px',
                    fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                  }}>
                    {listing.type === 'wanted' ? 'Wanted' : 'For Sale'}
                  </div>
                </div>
                
                <div className="listing-info">
                  <div className="listing-header-row">
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        {listing.petData.name}
                        <ShieldCheck size={16} style={{ color: '#10b981' }} title="Verified User" />
                      </h3>
                    </div>
                    <span className="listing-type">{listing.petData.breed || listing.petData.type}</span>
                  </div>
                  
                  <div className="listing-details">
                    <span><strong>Age:</strong> {listing.petData.age}</span>
                    <span><strong>Weight:</strong> {listing.petData.weight}</span>
                  </div>
                  
                  {listing.description && (
                    <p className="listing-desc">"{listing.description}"</p>
                  )}
                  
                  {listing.sellerId === currentUser?.uid ? (
                    <button onClick={() => handleMarkSold(listing.id)} className="btn btn-secondary contact-btn" style={{ borderColor: '#10b981', color: '#10b981' }}>
                      <CheckCircle size={16} />
                      Mark as Sold
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleMessage(listing)} className="btn btn-primary contact-btn" style={{ flex: 1 }}>
                        <MessageSquare size={16} />
                        Message
                      </button>
                      <button 
                        onClick={() => handleReport(listing.id)} 
                        className="btn btn-secondary icon-btn" 
                        title="Report Listing"
                        style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                      >
                        <Flag size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
