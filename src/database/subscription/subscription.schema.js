/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-type-email');

/**
 * Subscription Schema
 * @param _id => Id of the subscription
 * @param customerId => Id of the user
 * @param planId => Id of the plan
 * @param date => date when the subscription was created
 * @param currency => currency in which the payment was made
 */
const SubscriptionSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'Subscription ID is required'],
    unique: true,
  },
  customerId: {
    type: Schema.Types.String,
    required: [true, 'customerID is required'],
    default: null,
  },
  conversationId: {
    type: Schema.Types.String,
    required: [true, 'conversationID is required'],
    default: null,
  },
  planId: {
    type: Schema.Types.String,
    required: [true, 'planID is required'],
    default: null,
  },
  date: {
    type: Schema.Types.Date,
    required: [true, 'date is required'],
    default: new Date(),
  },
  currency: {
    type: Schema.Types.String,
    required: [true, 'currency is required'],
    default: null,
  },
}, { collection: 'subscription' });

module.exports = SubscriptionSchema;
