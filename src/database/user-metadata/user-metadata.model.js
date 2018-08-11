/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const UserMetadataSchema = require('./user-metadata.schema');

/**
 * Declare model
 */
const UserMetadataModel = mongoose.model('UserMetadataModel', UserMetadataSchema);

module.exports = UserMetadataModel;
