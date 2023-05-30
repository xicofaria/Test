const mongoose = require('mongoose');

const EventTrackingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
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

const EventTracking = mongoose.model('EventTracking', EventTrackingSchema);

module.exports = EventTracking;
