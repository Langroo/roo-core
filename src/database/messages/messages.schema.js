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
    position_in_dialogue: { type: Schema.Types.String, default: '0' },
    dialogue_name: { type: Schema.Types.String, default: 'HelloWorld' },
    content: { type: Schema.Types.String, required: false, default: 'Hello World!' },
    type: { type: Schema.Types.String, required: false, default: 'text' },
    category: { type: Schema.Types.String, required: false, default: 'reply' },
  },
  { collection: 'messages' })

// -- Create the model of the Schema in Mongo
const messagesModel = mongoose.model('messagesModel', messagesSchema)

module.exports = messagesModel
