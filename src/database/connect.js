/**
 * GLOBAL Dependencies
 */
const mongoose = require('mongoose')

/**
 * Start DB Connection
 */
const DB = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
mongoose.Promise = global.Promise
const connection = mongoose.connect(DB, {useMongoClient: true})
module.exports = connection
