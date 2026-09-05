import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Heart, Activity, FileText, ShieldCheck, Lock, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import './LandingPage.css';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      // Show the actual Firebase error message to help debug
      setError(err.message || 'Failed to authenticate. Check your credentials.');
      console.error("Auth Error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar animate-fade-in">
        <div className="logo">
          <PawPrint className="logo-icon" size={28} />
          <span>PetZone</span>
        </div>
      </nav>

      <div className="hero-section">
        {/* Left Side: Copy & Info */}
        <div className="hero-content animate-fade-in delay-100">
          <h1 className="hero-title">
            Your Pet's Health, <br/>
            <span className="text-gradient">Always in Your Pocket</span>
          </h1>
          <p className="hero-subtitle">
            Say goodbye to paper folders. Keep track of vaccines, weight, symptoms, and documents in one beautiful app. Instantly share a QR profile with your vet or sitter.
          </p>
          
          <div className="features-grid">
            <div className="feature-item glass-panel">
              <div className="icon-wrapper">
                <Heart className="feature-icon text-accent" />
              </div>
              <h3>All Records</h3>
              <p>Store vaccines and history securely.</p>
            </div>
            <div className="feature-item glass-panel">
              <div className="icon-wrapper">
                <Activity className="feature-icon text-secondary" />
              </div>
              <h3>Track Vitals</h3>
              <p>Log weight and symptoms over time.</p>
            </div>
            <div className="feature-item glass-panel">
              <div className="icon-wrapper">
                <FileText className="feature-icon text-primary" />
              </div>
              <h3>Share via QR</h3>
              <p>One scan gives vets instant access.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-section animate-fade-in delay-200">
          <div className="auth-card glass-panel">
            <h2>{isLogin ? 'Welcome Back' : 'Join PetZone'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Log in to manage your pets.' : 'Create an account to get started.'}
            </p>
            
            <form onSubmit={handleAuth}>
              {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <button type="submit" disabled={loading} className="btn btn-primary full-width">
                {isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            
            <div className="auth-switch">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  className="text-btn" 
                  onClick={() => setIsLogin(!isLogin)}
                  type="button"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck className="text-primary" size={24} />
          <span style={{ fontWeight: '500' }}>Verified Users Only</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Lock className="text-primary" size={24} />
          <span style={{ fontWeight: '500' }}>256-Bit Secure Data</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Users className="text-primary" size={24} />
          <span style={{ fontWeight: '500' }}>Trusted Community</span>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
