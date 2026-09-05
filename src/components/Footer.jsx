import './Footer.css';

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 style={{ margin: '0 0 0.5rem 0', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PetZone</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>A secure and trusted community for pet lovers.</p>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Support & Safety</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PetZone. All rights reserved.</p>
      </div>
    </footer>
  );
}
