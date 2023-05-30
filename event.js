const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalAttraction',
    required: true
  },
  isFreeEvent: {
    type: Boolean,
    default: true
  },
  ticketPrice: {
    type: Number,
    required: function () {
      return !this.isFreeEvent;
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;