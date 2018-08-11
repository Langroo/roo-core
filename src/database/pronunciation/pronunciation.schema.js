/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('mongoose-type-email')

/**
 * Pronunciation Schema
 * @param _id => Id of the pronunciation file | This is auto generated
 * @param user_id => User Identifier for the pronunciation file
 * @param statement => Statement which the user wants to pronounce
 * @param date => Datetime of the file creation
 * @param url => Pronounce URL on AWS bucket
 */
const PronunciationSchema = new Schema({
    user_id: {
        type: Schema.Types.String,
        required: [true, 'User ID is required']
    },
    statement: {
        type: Schema.Types.String,
        required: [true, 'Statement is required']
    },
    date: {
        type: Schema.Types.Date,
        default: Date.now()
    },
    url: {
        type: Schema.Types.String,
        required: [true, 'Amazon URL reference is needed']
    }
}, { collection: 'pronunciation' });

module.exports = PronunciationSchema
