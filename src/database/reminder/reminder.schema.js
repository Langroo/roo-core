/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReminderSchema = new Schema({
  userId: {
    type: Schema.Types.String,
    required: [true, '{user_id} is required'],
    index: true,
  },
  start_date: {
    type: Schema.Types.Date,
    required: [true, '{date} is required'],
  },
  message: {
    type: Schema.Types.String,
    required: [true, '{Message} to be send is required'],
    index: true,
  },
  flow_update: {
    type: Schema.Types.String,
    index: true,
  },
  repeat: {
    type: Schema.Types.Boolean,
    index: true,
  },
  next_date: {
    type: Schema.Types.String,
    index: true,
  },
}, { collection: 'reminders' })

module.exports = ReminderSchema
