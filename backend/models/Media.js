// models/Media.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['Resim', 'Video']
  },
  filePath: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);
