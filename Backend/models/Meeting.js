const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    link: { type: String, trim: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', MeetingSchema);


