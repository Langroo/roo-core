/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('mongoose-type-email')

/**
 * User Metadata Schema
 * @param _id => FB User identifier
 * @param source
 * @param value
 * @param know_identity_or_function
 * @param age
 * @param motivation_to_learn_english
 * @param current_job
 * @param subjects_studying
 * @param exam_studying
 * @param biggest_interests_personal
 * @param favorite_city
 * @param available_time_to_study
 * @param internet_speed
 * @param ad_referral
 * @param delay_time_between_messages
 * @param response_time
 * @param answers_to_content
 */
const UserMetadataSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'ID is required'],
    unique: true,
  },
  source_type: {
    type: Schema.Types.String,
    required: false,
  },
  source_name: {
    type: Schema.Types.String,
    required: false,
  },
  age: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  motivation_to_learn_english: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  current_job: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  subjects_studying: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  exam_studying: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  biggest_interests_personal: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  favorite_city: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  available_time_to_study: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  internet_speed: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  ad_referral: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  delay_time_between_messages: {
    type: Schema.Types.Number,
    required: false,
    default: 0.0,
  },
  response_time: {
    type: Schema.Types.Number,
    required: false,
    default: 0.0,
  },
  answers_to_content: {
    type: Schema.Types.String,
    required: false,
    default: 'Not Provided',
  },
  weekly_lesson_finished: {
    type: Schema.Types.Boolean,
    required: false,
    default: false,
  },
  daily_story_available: {
    type: Schema.Types.Boolean,
    required: false,
    default: true,
  },
  finished_flows: {
    type: [Schema.Types.String],
    required: false,
    default: [String],
  },
  last_position: [{
    type: { type: Schema.Types.String },
    content: Schema.Types.Mixed,
    trigger: Schema.Types.String,
  }],
  rating_value: {
    type: Schema.Types.Number,
    required: false,
    default: 0,
  },
}, { collection: 'user-metadata' })

module.exports = UserMetadataSchema
