/**
 * Global dependencies
 */
const mongoose = require('mongoose')

/**
 * Local dependencies
 */
const PronunciationSchema = require('./pronunciation.schema')

/**
 * Declare model
 */
const PronunciationModel = mongoose.model('PronunciationModel', PronunciationSchema)

module.exports = PronunciationModel
