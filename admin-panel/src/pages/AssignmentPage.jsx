import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Notification from '../components/Notification';
import { useNavigate } from 'react-router-dom';

function AssignmentPage() {
  const [screens, setScreens] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedScreens, setSelectedScreens] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScreens();
    fetchPlaylists();
  }, []);

  const fetchScreens = async () => {
    try {
      console.log('Fetching screens...');
      const response = await api.get('/api/screens');
      console.log('Screens response:', response.data);
      
      // Ensure we always set an array
      if (!response.data) {
        setScreens([]);
        return;
      }
      
      // If it's already an array, use it; otherwise, try to handle it or default to empty array
      const screensArray = Array.isArray(response.data) ? response.data : 
                         (response.data.screens ? response.data.screens : []);
      
      setScreens(screensArray);
      setError(null);
    } catch (error) {
      console.error('Ekran listesi alınırken hata:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Ekran listesi alınamadı: ' + error.message);
      setScreens([]);
    }
  };

  const fetchPlaylists = async () => {
    try {
      console.log('Fetching playlists...');
      const response = await api.get('/api/playlists');
      console.log('Playlists response:', response.data);
      
      // Ensure we always set an array
      if (!response.data) {
        setPlaylists([]);
        return;
      }
      
      // If it's already an array, use it; otherwise, try to handle it or default to empty array
      const playlistArray = Array.isArray(response.data) ? response.data : 
                          (response.data.playlists ? response.data.playlists : []);
      
      setPlaylists(playlistArray);
      setError(null);
    } catch (error) {
      console.error('Playlist listesi alınırken hata:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Playlist listesi alınamadı: ' + error.message);
      setPlaylists([]);
    }
  };

  const handleScreenSelect = (screenId) => {
    setSelectedScreens(prev => {
      if (prev.includes(screenId)) {
        return prev.filter(id => id !== screenId);
      } else {
        return [...prev, screenId];
      }
    });
  };

  const handleSelectAllScreens = () => {
    if (selectedScreens.length === screens.length) {
      setSelectedScreens([]);
    } else {
      setSelectedScreens(screens.map(screen => screen._id));
    }
  };

  const handleAssign = async () => {
    if (!selectedPlaylist || selectedScreens.length === 0) {
      setNotification('Lütfen bir playlist ve en az bir ekran seçin');
      return;
    }

    try {
      setLoading(true);
      const promises = selectedScreens.map(screenId =>
        api.put(`/api/screens/${screenId}`, {
          currentPlaylist: selectedPlaylist
        })
      );

      await Promise.all(promises);
      setNotification('Atama başarıyla tamamlandı');
      setSelectedScreens([]);
      setSelectedPlaylist('');
      setError(null);
      fetchScreens();
    } catch (error) {
      console.error('Atama hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Atama yapılırken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Playlist Atama</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <div style={styles.container}>
        <div style={styles.section}>
          <h3>Playlist Seçin</h3>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
            style={styles.select}
          >
            <option value="">Playlist seçin...</option>
            {Array.isArray(playlists) && playlists.map(playlist => (
              <option key={playlist._id} value={playlist._id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.section}>
          <h3>Ekranlar</h3>
          <button
            onClick={handleSelectAllScreens}
            style={styles.button}
            disabled={!Array.isArray(screens) || screens.length === 0}
          >
            {selectedScreens.length === screens.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
          </button>
          
          <div style={styles.screenGrid}>
            {!Array.isArray(screens) || screens.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
                {error ? 'Hata oluştu' : 'Henüz ekran bulunmuyor'}
              </div>
            ) : (
              screens.map(screen => (
                <div
                  key={screen._id}
                  style={{
                    ...styles.screenItem,
                    backgroundColor: selectedScreens.includes(screen._id) ? '#e3f2fd' : 'white'
                  }}
                  onClick={() => handleScreenSelect(screen._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedScreens.includes(screen._id)}
                    onChange={() => {}} // React controlled component için
                    style={styles.checkbox}
                  />
                  <span style={styles.screenName}>{screen.name}</span>
                  {screen.currentPlaylist && (
                    <span style={styles.currentPlaylist}>
                      Mevcut Playlist: {playlists.find(p => p._id === screen.currentPlaylist._id)?.name || 'Bulunamadı'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleAssign}
          disabled={loading || !selectedPlaylist || selectedScreens.length === 0}
          style={{
            ...styles.assignButton,
            opacity: (loading || !selectedPlaylist || selectedScreens.length === 0) ? 0.5 : 1
          }}
        >
          {loading ? 'Atanıyor...' : `Seçilen Ekranlara Ata (${selectedScreens.length})`}
        </button>
      </div>

      <Notification message={notification} onClose={() => setNotification('')} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    marginBottom: '20px'
  },
  select: {
    width: '100%',
    maxWidth: '300px',
    padding: '8px',
    fontSize: '16px',
    marginBottom: '20px'
  },
  screenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  screenItem: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  checkbox: {
    cursor: 'pointer'
  },
  screenName: {
    fontWeight: 'bold'
  },
  currentPlaylist: {
    fontSize: '0.9em',
    color: '#666',
    marginLeft: 'auto'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  assignButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    alignSelf: 'flex-start'
  }
};

export default AssignmentPage;
