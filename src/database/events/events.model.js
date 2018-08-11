/**
 * Global dependencies
 */
const mongoose = require('mongoose');

/**
 * Local dependencies
 */
const EventsSchema = require('./events.schema');

/**
 * Declare model
 */
const EventsModel = mongoose.model('EventsModel', EventsSchema);

module.exports = EventsModel;