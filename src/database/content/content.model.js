/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const ContentSchema = require('./content.schema');

/**
 * Declare model
 */
const ContentModel = mongoose.model('ContentModel', ContentSchema);

module.exports = ContentModel;
