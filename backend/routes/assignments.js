// routes/assignments.js
const express = require('express');
const router = express.Router();
const ScreenPlaylists = require('../models/ScreenPlaylists');
const Screen = require('../models/Screen');
const Playlist = require('../models/Playlist');

// Tüm atamaları listele (opsiyonel)
router.get('/', async (req, res) => {
  try {
    const allAssignments = await ScreenPlaylists.find({})
      .populate('screenId')
      .populate('playlistId');
    return res.json(allAssignments);
  } catch (err) {
    return res.status(500).json({ message: 'Sunucu hatası', error: err });
  }
});

// Döngüyü ekranlara atama
router.post('/', async (req, res) => {
  try {
    const { screenId, playlistId } = req.body;
    
    // Ekranı güncelle
    const updatedScreen = await Screen.findByIdAndUpdate(
      screenId,
      { currentPlaylist: playlistId },
      { new: true }
    ).populate('currentPlaylist');

    res.json(updatedScreen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
