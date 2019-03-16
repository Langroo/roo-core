/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;
const IntegerValidator = require('mongoose-integer');
require('mongoose-type-email');

/**
 * Plan Schema
 * @param _id => Id of the plan
 * @param name => name of the plan
 * @param description => description of the plan
 * @param billing_frequency => Time of billing
 * @param billing_frequency.period_type => type of time
 * @param billing_frequency.period_quantity => quantity of the time interval (n days, n weeks, n months)
 * @param price_in_euros => price of the plan in euros
 * @param enabled => bool indicating availability of the plan
 */
const PlanSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'ID is required'],
    unique: true,
  },
  name: {
    type: Schema.Types.String,
    default: null,
  },
  description: {
    type: Schema.Types.String,
    defaul: null,
  },
  detail: {
    type: [Schema.Types.String],
    default: null,
  },
  billing_frequency: {
    type: {
      period_type: {
        type: Schema.Types.String,
        required: [true, 'periodType is required'],
        enum: ['day', 'week', 'month', 'year'],
      },
      period_quantity: {
        type: Schema.Types.Number,
        required: [true, 'frequency is required'],
      },
    },
    default: {
      period_type: 'week',
      period_quantity: 2,
    },
  },
  price: {
    type: Schema.Types.Number,
    required: [true, 'Price is required'],
    default: 1.0,
  },
  currency: {
    type: Schema.Types.String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'EUR'],
    default: 'EUR',
  },
  enabled: {
    type: Schema.Types.Boolean,
    required: [true, 'plan being enabled is required'],
    default: true,
  },
}, { collection: 'plan' });

/**
 * Enable plugins
 */
PlanSchema.plugin(IntegerValidator);

module.exports = PlanSchema;
