/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Metric Schema
 * @param id => ID auto generated
 * @param date => Tracked date
 * @param numberOfEvents => Fully count of events
 * @param numberOfNewUsers => Count just the new users of the day
 * @param avgOfMessagesPerUser => Average of messages per user of the day
 * @param surveysCompleted => Amoun of surveys completed
 */
const MetricSchema = new Schema({
  date: {
    type: Schema.Types.Date,
    required: [true, 'Date is required'],
    index: true,
  },
  numberOfEvents: {
    type: Schema.Types.Number,
    required: [true, 'numberOfEvents is required'],
  },
  numberOfNewUsers: {
    type: Schema.Types.Number,
    required: [true, 'numberOfNewUsers is required'],
  },
  avgOfMessagesPerUser: {
    type: Schema.Types.Number,
    required: [true, 'avgOfMessagesPerUser is required'],
  },
  surveysCompleted: {
    type: Schema.Types.Number,
    required: [true, 'surveysCompleted is required'],
  },
}, { collection: 'metric' });

module.exports = MetricSchema;
