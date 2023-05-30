const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  culturalAttraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalAttraction',
    required: true
  },
  isEvent: {
    type: Boolean,
    default: false
  },
  selectedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: function () {
      return this.isEvent === true;
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  customerPointsDeducted: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
