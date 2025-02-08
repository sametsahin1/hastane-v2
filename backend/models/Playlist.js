// models/Playlist.js
const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mediaItems: [{
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: true
    },
    duration: {
      type: Number,
      default: 5
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Playlist', playlistSchema);
