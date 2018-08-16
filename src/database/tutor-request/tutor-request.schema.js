/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * TutorRequest Schema
 */
const TutorRequestSchema = new Schema({
  user_id: {
    type: Schema.Types.String,
    required: [true, 'User ID is required'],
  },
  current_country: {
    type: Schema.Types.String,
    required: false,
  },
  self_description: {
    type: Schema.Types.String,
    required: false,
  },
  interests: {
    type: Schema.Types.String,
    required: false,
  },
  time_of_day_for_calls: [{
    type: Schema.Types.String,
    enum: ['TFB_MORNING', 'TFB_MORNING_ALT', 'TFB_AFTERNOON', 'TFB_AFTERNOON_ALT', 'TFB_EVENING', 'TFB_EVENING_ALT'],
  }],
  time_of_week_for_calls: {
    type: Schema.Types.String,
    enum: ['TFB_WEEKDAYS', 'TFB_WEEKENDS'],
  },
  days_of_week_for_calls: {
    type: Schema.Types.String,
    required: false,
  },
  date: {
    type: Schema.Types.Date,
    required: false,
  },
  internet_speed_description: {
    type: Schema.Types.String,
    required: false,
  },
  other_information: {
    type: Schema.Types.String,
    required: false,
  },
  can_pay: {
    type: Schema.Types.Boolean,
    required: true,
  },
}, { collection: 'tutor-request' })

module.exports = TutorRequestSchema
