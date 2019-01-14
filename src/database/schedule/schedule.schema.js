const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'ID is required'],
    unique: true,
  },
  send_to: {
    type: Schema.Types.String,
    required: [true, 'User ID is required'],
  },
  lesson: {
    type: Schema.Types.Number,
  },
  date: {
    type: Schema.Types.Date,
    required: [true, 'Messages Date is required'],
  },
  cronjob_status: {
    type: Schema.Types.Boolean,
    default: false,
  },
  type: {
    type: Schema.Types.String,
    enum: ['main', 'alternative', 'send/start', 'on-demand', 'saturday', 'sunday', 'rating-system'],
    default: 'main',
  },
  parent: {
    type: Schema.Types.String,
    default: null,
  },
  messages: [{
    type: { type: Schema.Types.String },
    content: Schema.Types.Mixed,
    trigger: Schema.Types.String,
  }],
}, { collection: 'schedule' });

module.exports = ScheduleSchema;
