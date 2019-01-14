/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const SubscriptionSchema = require('./subscription.schema');

/**
 * Declare model
 */
const SubscriptionModel = mongoose.model('SubscriptionModel', SubscriptionSchema);

module.exports = SubscriptionModel;
