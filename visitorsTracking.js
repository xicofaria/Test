const mongoose = require('mongoose');

const VisitorTrackingSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalAttraction',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  visitors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
});

const VisitorTracking = mongoose.model('VisitorTracking', VisitorTrackingSchema);

module.exports = VisitorTracking;

