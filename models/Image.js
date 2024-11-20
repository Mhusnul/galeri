const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  imagePath: String,
  metadata: {
    uploadedAt: { type: Date, default: Date.now },
    size: Number
  }
});

module.exports = mongoose.model('Image', imageSchema);
