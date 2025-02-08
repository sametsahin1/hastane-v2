// models/ScreenPlaylists.js
const mongoose = require('mongoose');

const screenPlaylistsSchema = new mongoose.Schema({
  screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
  playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
  isActive: { type: Boolean, default: true },
  assignedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScreenPlaylists', screenPlaylistsSchema);
