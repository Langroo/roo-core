/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const IntegerValidator = require('mongoose-integer');

/**
 * Content Schema
 */
const ContentSchema = new Schema({
  language: {
    type: Schema.Types.String,
    required: [true, 'Content language is required'],
    index: true,
  },
  lesson: {
    type: Schema.Types.Number,
    integer: true,
    required: [true, 'Day is required'],
  },
  type: {
    type: Schema.Types.String,
    required: [true, 'Type is required'],
    enum: ['week', 'saturday', 'sunday'],
  },
  message_id: {
    type: Schema.Types.Number,
    required: [false, 'Message ID is required'],
  },
  message: {
    type: { type: Schema.Types.String },
    content: Schema.Types.Mixed,
  },
  pause: {
    type: Schema.Types.Boolean,
    default: false,
  },
}, { collection: 'content' });

/**
 * Enable plugins
 */
ContentSchema.plugin(IntegerValidator);

module.exports = ContentSchema;
