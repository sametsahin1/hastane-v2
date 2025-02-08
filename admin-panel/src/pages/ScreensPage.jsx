import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

function ScreensPage() {
  const [screenName, setScreenName] = useState('');
  const [screens, setScreens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScreens();
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

  const addScreen = async () => {
    if (!screenName) {
      setError('Ekran adı zorunludur');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/screens', {
        name: screenName,
        status: 'active'
      });
      setScreenName('');
      setError(null);
      fetchScreens();
    } catch (error) {
      console.error('Ekran ekleme hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Ekran eklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScreen = async (screenId) => {
    try {
      await api.delete(`/api/screens/${screenId}`);
      fetchScreens();
      setError(null);
    } catch (error) {
      console.error('Ekran silme hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Ekran silinirken hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Ekran Ekleme/Listeme</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <div className='input-screen-container'>
        <input
          className='input-screen-name'
          placeholder="Ekran Adı"
          value={screenName}
          onChange={(e) => setScreenName(e.target.value)}
        />
        <button 
          className='input-screen-button' 
          onClick={addScreen}
          disabled={loading}
        >
          {loading ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </div>
      
      <h3>Tüm Ekranlar</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Mevcut Playlist</th>
            <th>İşlemler</th>
            <th>Önizleme</th>
          </tr>
        </thead>
        <tbody>
          {!Array.isArray(screens) || screens.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                {error ? 'Hata oluştu' : 'Henüz ekran bulunmuyor'}
              </td>
            </tr>
          ) : (
            screens.map(screen => (
              <tr key={screen._id}>
                <td>{screen.name}</td>
                <td>{screen.currentPlaylist ? screen.currentPlaylist.name : 'Atanmamış'}</td>
                <td>
                  <button className='input-screen-buttonared'
                    onClick={() => handleDeleteScreen(screen._id)}
                    style={styles.deleteButton}
                  >
                    Sil
                  </button>
                </td>
                <td>
                  <Link className='input-screen-buttona' to={`/preview/${screen._id}`}>Önizle</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default ScreensPage;
