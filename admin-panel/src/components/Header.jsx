import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css'

function Header() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="main-header">
      <div className="header-logo">
        <a href="/">Hastane Ekran Yönetimi</a>
      </div>

      <nav className="header-nav">
        <ul>
          <li><Link to="/" style={styles.link}>Medya</Link></li>
          <li><Link to="/playlists" style={styles.link}>Playlistler</Link></li>
          <li><Link to="/screens" style={styles.link}>Ekranlar</Link></li>
          <li><Link to="/assignment" style={styles.link}>Atama</Link></li>
        </ul>
      </nav>

      <div className="header-user">
        <button onClick={handleLogout} style={styles.logoutButton}>
          Çıkış Yap
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#333',
    padding: '1rem',
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  logoutButton: {
    marginLeft: 'auto',
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Header;
