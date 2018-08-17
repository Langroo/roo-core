const messagesManagement = require('../../database/messages').management
const dialoguesMessages = {
  replies: async () => await messagesManagement.retrieve(),

  get messages () {
    return this.replies
  },
}

module.exports = dialoguesMessages
