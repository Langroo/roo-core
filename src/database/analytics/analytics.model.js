const mongoose = require('mongoose');
const AnalyticsSchema = require('./analytics.schema');
const AnalyticsModel = mongoose.model('AnalyticsModel', AnalyticsSchema);

module.exports = AnalyticsModel;
