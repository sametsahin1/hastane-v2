// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// MongoDB'ye bağlan
connectDB();

// middleware
app.use(cors());
app.use(bodyParser.json());

// Uploads klasörünü oluştur
const uploadsDir = '/app/uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Uploads klasörünü statik olarak serve et
app.use('/uploads', express.static(uploadsDir));

console.log('Uploads tam yolu:', uploadsDir);
// Rota dosyaları
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const playlistRoutes = require('./routes/playlists');
const screenRoutes = require('./routes/screens');
const assignmentRoutes = require('./routes/assignments');

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/assignments', assignmentRoutes);

// Basit test
app.get('/', (req, res) => {
  res.send('Hastane Ekran Sistemi API çalışıyor');
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(500).json({
    message: 'Sunucu hatası',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
