/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const UserSchema = require('./user.schema');

/**
 * Declare model
 */
const UserModel = mongoose.model('UserModel', UserSchema);

module.exports = UserModel;
