// routes/playlists.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Tüm playlistleri getir
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate({
        path: 'mediaItems.media',
        model: 'Media',
        select: 'name mediaType filePath duration'
      })
      .sort({ createdAt: -1 });

    console.log('Playlists:', playlists); // Debug için log
    res.json(playlists);
  } catch (error) {
    console.error('Playlist listesi hatası:', error);
    res.status(500).json({ 
      message: 'Playlist listesi alınırken hata oluştu',
      error: error.message 
    });
  }
});

// Yeni playlist oluştur
router.post('/', async (req, res) => {
  try {
    console.log('Gelen playlist verisi:', req.body); // Debug için log

    const playlist = new Playlist({
      name: req.body.name,
      mediaItems: req.body.mediaItems
    });

    const savedPlaylist = await playlist.save();
    console.log('Kaydedilen playlist:', savedPlaylist); // Debug için log

    const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
      .populate({
        path: 'mediaItems.media',
        model: 'Media',
        select: 'name mediaType filePath duration'
      });

    res.status(201).json(populatedPlaylist);
  } catch (error) {
    console.error('Playlist oluşturma hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Playlist'e medya ekle
router.post('/:id/media', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist bulunamadı' });
    }

    playlist.mediaItems.push({
      media: req.body.mediaId,
      duration: req.body.duration || 5
    });

    const updatedPlaylist = await playlist.save();
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Medya ekleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Playlist'i güncelle
router.put('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        mediaItems: req.body.mediaItems
      },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist bulunamadı' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Playlist güncelleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Playlist'i sil
router.delete('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist bulunamadı' });
    }
    res.json({ message: 'Playlist başarıyla silindi' });
  } catch (error) {
    console.error('Playlist silme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Tek bir playlist'i getir
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: 'mediaItems.media',
        model: 'Media',
        select: 'name mediaType filePath duration'
      });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist bulunamadı' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Playlist getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
