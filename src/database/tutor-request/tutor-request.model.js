/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const TutorRequestSchema = require('./tutor-request.schema');

/**
 * Declare model
 */
const TutorRequestModel = mongoose.model('TutorRequestModel', TutorRequestSchema);

module.exports = TutorRequestModel;
