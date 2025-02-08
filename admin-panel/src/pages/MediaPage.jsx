import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function MediaPage() {
  const [file, setFile] = useState(null);
  const [mediaName, setMediaName] = useState('');
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchMedias();
  }, []);

  const fetchMedias = async () => {
    try {
      console.log('Fetching media...');
      const response = await api.get('/api/media');
      console.log('Media API Response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      const mediaArray = Array.isArray(response.data) ? response.data : [];
      setMedias(mediaArray);
      setError(null);
    } catch (error) {
      console.error('Medya listesi alınırken hata:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Medya listesi alınamadı: ' + error.message);
      setMedias([]);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      setFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/media/${id}`);
      fetchMedias();
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleUpload = async () => {
    if (!file || !mediaName) {
      alert('Lütfen bir dosya seçin ve medya adı girin');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', mediaName);
    
    try {
      setLoading(true);
      const response = await api.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      setFile(null);
      setMediaName('');
      fetchMedias();
    } catch (error) {
      console.error('Upload error details:', error.response?.data || error);
      alert('Yükleme hatası: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
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

  return (
    <div style={{ margin: '20px' }}>
      <h2>Medya Yönetimi</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      <div style={styles.uploadForm}>
        <input
          type="text"
          placeholder="Medya Adı"
          value={mediaName}
          onChange={(e) => setMediaName(e.target.value)}
          className='mediainput'
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={styles.input}
          ref={fileInputRef}
        />
        <button 
          onClick={handleButtonClick}
          style={styles.button}
        >
          Dosya Seç
        </button>
        <button 
          onClick={handleUpload}
          disabled={loading || !file || !mediaName}
          style={styles.uploadButton}
        >
          {loading ? 'Yükleniyor...' : 'Yükle'}
        </button>
      </div>

      <h3>Medya Listesi</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Önizleme</th>
            <th>Ad</th>
            <th>Tür</th>
            <th>Oluşturulma Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {!Array.isArray(medias) || medias.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                {error ? 'Hata oluştu' : 'Henüz medya bulunmuyor'}
              </td>
            </tr>
          ) : (
            medias.map(media => (
              <tr key={media._id}>
                <td style={styles.previewCell}>
                  {media.mediaType === 'Video' ? (
                    <video
                      src={getMediaUrl(media.filePath)}
                      style={styles.preview}
                      controls
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
                <td>{media.mediaType || 'Belirtilmemiş'}</td>
                <td>{media.createdAt ? new Date(media.createdAt).toLocaleString() : 'Belirtilmemiş'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(media._id)}
                    className='deletebutton'
                  >
                    Sil
                  </button>
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
  uploadForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center'
  },
  input: {
    display: 'none',
  },
  button: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  },
  previewCell: {
    width: '100px',
    height: '60px',
    padding: '5px'
  },
  preview: {
    width: '100px',
    height: '60px',
    objectFit: 'cover'
  },
  deleteButton: {
    padding: 0,
    color: 'white',
    height: '2em',
    width: '4em',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  mediaItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    padding: '10px'
  },
  mediaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  }
};

export default MediaPage;
