const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team',
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  invitee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);
module.exports = TeamInvitation;


