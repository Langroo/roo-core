/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Login Schema
 * @param id => ID of the user
 * @param token => Token of the user
 * @param name => Name of the user
 */
const LoginSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'ID is required'],
    unique: true,
  },
  token: {
    type: Schema.Types.String,
    required: [true, 'Token is required'],
  },
  name: {
    type: Schema.Types.String,
    required: [true, 'Name is required'],
  },
}, { collection: 'login' });

module.exports = LoginSchema;
