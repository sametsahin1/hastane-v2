import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

function PreviewPage() {
  const { screenId } = useParams();
  const [screen, setScreen] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchScreen = async () => {
      try {
        console.log('Fetching screen config...');
        const response = await api.get(`/api/screens/${screenId}/config`);
        console.log('Screen config response:', response.data);
        setScreen(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ekran bilgileri alınırken hata:', error);
        setError(error.response?.data?.message || 'Ekran bilgileri alınamadı');
        setLoading(false);
      }
    };

    fetchScreen();
  }, [screenId]);

  useEffect(() => {
    if (screen?.playlist?.mediaItems?.length > 0) {
      const currentMedia = screen.playlist.mediaItems[currentMediaIndex];
      const timer = setTimeout(() => {
        setCurrentMediaIndex((prevIndex) => 
          (prevIndex + 1) % screen.playlist.mediaItems.length
        );
      }, (currentMedia.duration || 5) * 1000);

      return () => clearTimeout(timer);
    }
  }, [screen, currentMediaIndex]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;
  if (!screen) return <div>Ekran bulunamadı</div>;
  if (!screen.playlist?.mediaItems?.length) {
    return <div>Bu ekrana atanmış medya bulunamadı</div>;
  }

  const currentMedia = screen.playlist.mediaItems[currentMediaIndex];

  return (
    <div style={styles.container}>
      <div style={styles.mediaContainer}>
        {currentMedia.mediaType === 'Video' ? (
          <video
            key={currentMedia.id}
            src={getMediaUrl(currentMedia.filePath)}
            style={styles.media}
            autoPlay
            muted
            onEnded={() => {
              setCurrentMediaIndex((prevIndex) => 
                (prevIndex + 1) % screen.playlist.mediaItems.length
              );
            }}
          />
        ) : (
          <img
            key={currentMedia.id}
            src={getMediaUrl(currentMedia.filePath)}
            alt={currentMedia.name}
            style={styles.media}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
};

export default PreviewPage; 