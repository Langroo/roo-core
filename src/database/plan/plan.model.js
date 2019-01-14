/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const PlanSchema = require('./plan.schema');

/**
 * Declare model
 */
const PlanModel = mongoose.model('PlanModel', PlanSchema);

module.exports = PlanModel;
