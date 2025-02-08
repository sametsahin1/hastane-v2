import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [medias, setMedias] = useState([]);
  const [selectedMedias, setSelectedMedias] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaDurations, setMediaDurations] = useState({});

  useEffect(() => {
    fetchPlaylists();
    fetchMedias();
  }, []);

  const fetchPlaylists = async () => {
    try {
      console.log('Fetching playlists...');
      const response = await api.get('/api/playlists');
      console.log('Playlists API Response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      if (!response.data) {
        console.warn('API yanıtında data yok');
        setPlaylists([]);
        return;
      }

      if (!Array.isArray(response.data)) {
        console.warn('API yanıtı array değil:', response.data);
        // Eğer response.data.playlists varsa ve array ise onu kullan
        if (response.data.playlists && Array.isArray(response.data.playlists)) {
          setPlaylists(response.data.playlists);
        } else {
          setPlaylists([]);
        }
        return;
      }
      
      setPlaylists(response.data);
      setError(null);
    } catch (error) {
      console.error('Playlist listesi alınırken hata:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError('Playlist listesi alınamadı: ' + error.message);
      setPlaylists([]);
    }
  };

  const fetchMedias = async () => {
    try {
      setMediaLoading(true);
      console.log('Fetching media...');
      const response = await api.get('/api/media');
      console.log('Media API Response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      // Yanıtın data kısmını kontrol et
      if (!response.data) {
        console.warn('API yanıtında data yok');
        setMedias([]);
        return;
      }

      // Eğer data bir array değilse ve data.medias bir array ise onu kullan
      let mediaData = [];
      if (Array.isArray(response.data)) {
        mediaData = response.data;
      } else if (response.data.medias && Array.isArray(response.data.medias)) {
        mediaData = response.data.medias;
      } else {
        console.warn('API yanıtı geçersiz format:', response.data);
        setMedias([]);
        return;
      }

      setMedias(mediaData);
    } catch (error) {
      console.error('Medya listesi alınırken hata:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setMedias([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaSelect = (mediaId) => {
    setSelectedMedias(prev => {
      const exists = prev.find(item => item.media === mediaId);
      if (exists) {
        // Remove from selected medias
        const newSelected = prev.filter(item => item.media !== mediaId);
        // Also remove from durations
        const newDurations = { ...mediaDurations };
        delete newDurations[mediaId];
        setMediaDurations(newDurations);
        return newSelected;
      } else {
        // Add to selected medias with default or existing duration
        return [...prev, { media: mediaId, duration: mediaDurations[mediaId] || 5 }];
      }
    });
  };

  const handleDurationChange = (mediaId, duration) => {
    // Update durations state
    setMediaDurations(prev => ({
      ...prev,
      [mediaId]: parseInt(duration) || 5
    }));
    
    // Update selected medias with new duration
    setSelectedMedias(prev => 
      prev.map(item => 
        item.media === mediaId 
          ? { ...item, duration: parseInt(duration) || 5 }
          : item
      )
    );
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName || selectedMedias.length === 0) {
      alert('Lütfen playlist adı girin ve en az bir medya seçin');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/playlists', {
        name: playlistName,
        mediaItems: selectedMedias
      });
      console.log('Create playlist response:', response.data);
      setPlaylistName('');
      setSelectedMedias([]);
      fetchPlaylists();
    } catch (error) {
      console.error('Playlist oluşturma hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Playlist oluşturulurken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await api.delete(`/api/playlists/${id}`);
      fetchPlaylists();
    } catch (error) {
      console.error('Playlist silme hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Playlist silinirken hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  };

  // Medya dosyasının yolunu düzenleyen yardımcı fonksiyon
  const getMediaUrl = (filePath) => {
    if (!filePath) return '';
    
    const baseURL = import.meta.env.VITE_API_URL || '';
    
    // Eğer filePath tam URL ise olduğu gibi kullan
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // uploads/ ile başlayan yolları düzelt
    if (filePath.startsWith('uploads/')) {
      return baseURL ? `${baseURL}/${filePath}` : `/${filePath}`;
    }
    
    // /uploads/ ile başlayan yolları düzelt
    if (filePath.startsWith('/uploads/')) {
      return baseURL ? `${baseURL}${filePath}` : filePath;
    }
    
    // Diğer durumlar için
    return baseURL ? `${baseURL}/uploads/${filePath.replace(/^\/+/, '')}` : `/uploads/${filePath.replace(/^\/+/, '')}`;
  };

  const renderMediaItem = (mediaItem) => {
    if (!mediaItem?.media) {
      console.warn('Medya öğesi veya media property bulunamadı:', mediaItem);
      return null;
    }

    const { media } = mediaItem;
    const mediaUrl = getMediaUrl(media.filePath);

    return (
      <tr key={mediaItem._id}>
        <td style={styles.previewCell}>
          {media.mediaType === 'Video' ? (
            <video
              src={mediaUrl}
              style={styles.preview}
              controls
            />
          ) : (
            <img
              src={mediaUrl}
              alt={media.name}
              style={styles.preview}
            />
          )}
        </td>
        <td>{media.name}</td>
        <td>{media.mediaType}</td>
        <td>{mediaItem.duration} saniye</td>
      </tr>
    );
  };

  const renderPlaylistItem = (playlist) => {
    return (
      <div key={playlist._id} style={styles.playlistItem}>
        <div style={styles.playlistHeader}>
          <h4>{playlist.name}</h4>
          <button
            onClick={() => handleDeletePlaylist(playlist._id)}
            style={styles.deleteButton}
          >
            Sil
          </button>
        </div>
        <table style={styles.mediaTable}>
          <thead>
            <tr>
              <th>Önizleme</th>
              <th>Ad</th>
              <th>Tür</th>
              <th>Süre</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(playlist.mediaItems) || playlist.mediaItems.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>
                  Bu playlist'te henüz medya bulunmuyor
                </td>
              </tr>
            ) : (
              playlist.mediaItems.map(mediaItem => renderMediaItem(mediaItem))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMediaGrid = () => {
    if (mediaLoading) {
      return (
        <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
          Medyalar yükleniyor...
        </div>
      );
    }

    const mediaArray = Array.isArray(medias) ? medias : [];
    
    if (mediaArray.length === 0) {
      return (
        <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
          Henüz medya bulunmuyor
        </div>
      );
    }

    return (
      <table style={styles.mediaTable}>
        <thead>
          <tr>
            <th>Önizleme</th>
            <th>Ad</th>
            <th>Tür</th>
            <th>Süre (saniye)</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {mediaArray.map((media) => {
            const isSelected = selectedMedias.find(item => item.media === media._id);
            return (
              <tr key={media._id}>
                <td style={styles.previewCell}>
                  {media.mediaType === 'Video' ? (
                    <video
                      src={getMediaUrl(media.filePath)}
                      style={styles.preview}
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={getMediaUrl(media.filePath)}
                      alt={media.name}
                      style={styles.preview}
                    />
                  )}
                </td>
                <td>{media.name}</td>
                <td>{media.mediaType}</td>
                <td style={styles.durationCell}>
                  <input
                    type="number"
                    min="1"
                    value={mediaDurations[media._id] || 5}
                    onChange={(e) => handleDurationChange(media._id, e.target.value)}
                    style={styles.durationInput}
                    disabled={!isSelected}
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleMediaSelect(media._id)}
                    style={{
                      ...styles.selectButton,
                      backgroundColor: isSelected ? '#28a745' : '#007bff'
                    }}
                  >
                    {isSelected ? 'Seçildi' : 'Seç'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Playlist Yönetimi</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <div style={styles.createForm}>
        <input
          type="text"
          placeholder="Playlist Adı"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          style={styles.input}
        />
        <div style={styles.mediaGrid}>
          {renderMediaGrid()}
        </div>
        <button
          onClick={handleCreatePlaylist}
          disabled={loading || !playlistName || selectedMedias.length === 0}
          style={{
            ...styles.button,
            backgroundColor: loading || !playlistName || selectedMedias.length === 0 ? '#ccc' : '#007bff'
          }}
        >
          {loading ? 'Oluşturuluyor...' : 'Playlist Oluştur'}
        </button>
      </div>

      <h3>Playlist Listesi</h3>
      <div style={styles.playlistGrid}>
        {!Array.isArray(playlists) ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '20px', color: 'red' }}>
            Playlist listesi alınırken bir hata oluştu
          </div>
        ) : playlists.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
            {error ? 'Hata oluştu' : 'Henüz playlist bulunmuyor'}
          </div>
        ) : (
          playlists.map((playlist) => renderPlaylistItem(playlist))
        )}
      </div>
    </div>
  );
}

const styles = {
  createForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px'
  },
  input: {
    padding: '8px',
    fontSize: '16px',
    maxWidth: '300px',
    marginBottom: '0px'
  },
  mediaGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  mediaItem: {
    width: 'calc(33.33% - 8px)',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  preview: {
    width: '107px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  mediaInfo: {
    marginTop: '8px',
    textAlign: 'center'
  },
  button: {
    padding: '10px',
    color: 'white',
    border: 'none',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'pointer',
    maxWidth: '200px'
  },
  playlistGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%'
  },
  playlistItem: {
    width: '100%',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  playlistHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '0 10px'
  },
  mediaTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    border: '1px solid #eee',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  previewCell: {
    width: '120px',
    padding: '10px',
    textAlign: 'center',
    borderBottom: '1px solid #eee'
  },
  preview: {
    width: '107px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  deleteButton: {
    padding: 0,
    color: 'white',
    height: '2em',
    width: '4em',    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#c82333'
    }
  },
  mediaPreview: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  previewItem: {
    width: 'calc(33.33% - 8px)',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  smallPreview: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  selectButton: {
    padding: 0,
    color: 'white',
    height: '2em',
    width: '4em',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  durationCell: {
    padding: '5px',
    textAlign: 'center',
    width: '120px'
  },
  durationInput: {
    width: '80px',
    marginBottom: '0px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    textAlign: 'center'
  }
};

export default PlaylistsPage;
