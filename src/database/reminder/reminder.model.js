/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const ReminderSchema = require('./reminder.schema');

/**
 * Declare model
 */
const ReminderModel = mongoose.model('ReminderModel', ReminderSchema);

module.exports = ReminderModel;