const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const playlistRoutes = require('./routes/playlists');
const mediaRoutes = require('./routes/media');

// CORS ayarları
app.use(cors({
    origin: '*', // Tüm originlere izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Uploads dizininin tam yolunu logla
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Uploads tam yolu:', uploadsPath);

// Medya dosyalarına erişim için uploads dizinini statik olarak serve et
app.use('/uploads', express.static(uploadsPath));

// API rotaları
app.use('/api/playlists', playlistRoutes);
app.use('/api/media', mediaRoutes);

module.exports = app; 