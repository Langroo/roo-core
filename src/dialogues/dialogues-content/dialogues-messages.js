const messagesManagement = require('../../database/messages').management
const dialoguesMessages = {
  replies: async () => {
    const formattedReplies = {}
    const arrayFromDB = await messagesManagement.retrieve()

    // -- Initialize the formattedReplies object
    for (const element of arrayFromDB) {
      formattedReplies[element.dialogue_name] = []
    }

// -- Fill the formattedReplies objects with an array of objects
    for (const msgs of arrayFromDB) {
      formattedReplies[msgs.dialogue_name]
        .splice(
          parseInt(msgs.position_in_dialogue, 10),
          0,
          { type: msgs.type, content: msgs.content })
    }

    return formattedReplies
  },

  get messages () {
    return this.replies()
  },
}

module.exports = dialoguesMessages
