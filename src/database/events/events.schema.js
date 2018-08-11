/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Events Schema
 * @param id => ID auto generated
 * @param senderId => sender Id of the user
 * @param rawInput => raw message received
 * @param isPostback => check if the  user pressed a button or not
 * @param date => date the input was received
 */
const EventsSchema = new Schema({
	userId: {
		type: Schema.Types.String,
		required: [true, 'userId is required'],
		index: true,
	},
	rawInput: {
		type: Schema.Types.String,
		required: [true, 'rawInput is required'],
	},
	isPostback: {
		type: Schema.Types.Boolean,
		required: [true, 'isPostback is required'],
	},
	date: {
		type: Schema.Types.Date,
		required: [true, 'date is required'],
		default: Date.now(),
		index: true,
	},
}, { collection: 'events' })

module.exports = EventsSchema
