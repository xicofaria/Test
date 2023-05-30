const mongoose = require('mongoose');

const CulturalAttractionSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    photos: [{
      type: String, // Assuming storing the file paths or URLs of the photos
      required: true
    }],
    videos: [{
      type: String, // Assuming storing the file paths or URLs of the videos
      required: true
    }],
    ticketPrice: {
      type: Number,
      required: true
    }
  });

const CulturalAttraction = mongoose.model('CulturalAttraction', CulturalAttractionSchema);

module.exports = CulturalAttraction;
