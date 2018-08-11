const mongoose = require('mongoose')
const Schema = mongoose.Schema
const IntegerValidator = require('mongoose-integer')

/**
 * Analytics Schema
 */
const AnalyticsSchema = new Schema({
  user_id: {
    type: Schema.Types.String,
    required: [true, 'Analytics user_id is required'],
    index: true,
  },
  type: {
    type: Schema.Types.String,
    required: [true, 'Analytics type is required'],
    index: true,
  },
  key: {
    type: Schema.Types.String,
    required: [true, 'Analytics key is required'],
    index: true,
  },
  value: {
    type: Schema.Types.String,
    required: [true, 'Analytics value is required'],
  },
  sentence: {
    type: Schema.Types.String,
    required: false,
  },
  createdAt: {
    type: Schema.Types.Date,
    required: [true, 'Analytics createdAt is required'],
    default: Date.now(),
  },
}, { collection: 'analytics' })

AnalyticsSchema.plugin(IntegerValidator)

module.exports = AnalyticsSchema
