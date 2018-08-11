/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const LoginSchema = require('./login.schema');

/**
 * Declare model
 */
const LoginModel = mongoose.model('LoginModel', LoginSchema);

module.exports = LoginModel;
