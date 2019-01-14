/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const MetricSchema = require('./metric.schema');

/**
 * Declare model
 */
const MetricModel = mongoose.model('MetricModel', MetricSchema);

module.exports = MetricModel;
