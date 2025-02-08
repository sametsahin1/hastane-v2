// models/Screen.js
const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  currentPlaylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Screen', screenSchema);
