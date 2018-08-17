const mongoose = require('mongoose')
const Schema = mongoose.Schema

// -- Define the schema
/*
* @_id: unique message id
* @name: name of the message or the entity
* @message: stringified object with all the properties of the message in generic format
* @type: text, image, cards, audio, video
* @category: reply, broadcast, content
* */
const messagesSchema = new Schema({
    name: { type: Schema.Types.String, default: 'unnamed' },
    message: { type: Schema.Types.String, required: false, default: '{ type: \'text\', content: \'Hello World!\' }' },
    type: { type: Schema.Types.String, required: false, default: 'text' },
    category: { type: Schema.Types.String, required: false, default: 'reply' },
  },
  { collection: 'messages' })

// -- Create the model of the Schema in Mongo
const messagesModel = mongoose.model('messagesModel', messagesSchema)

module.exports = messagesModel
