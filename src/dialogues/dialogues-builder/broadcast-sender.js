const templates = require('./templates')
const dialoguesContent = require('../dialogues-content').dialoguesContent
const axios = require('axios')

class broadcastSender {

  static async getCreativeId (message) {
    // -- The format of the message from the dialog is in a generic format
    // -- We need to format it to the Facebook format
    const formattedMessage = templates.format(message)
    // -- Execute the first step to send a single Broadcast Message
    // -- Get that message's ID from Facebook
    const fromFacebook = await axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/message_creatives?access_token=${process.env.FB_ACCESS_TOKEN}`,
      method: 'post',
      data: JSON.stringify(formattedMessage),
    })
      .catch(error => {
        console.log('\nERROR REQUESTING CREATIVE IDS FOR BROADCAST MESSAGES\n', error.response)
      })
    return fromFacebook.data.message_creative_id
  }

  static async prepareCreativeIdsArray (dialogName) {
    // -- The Dialog is an array of messages
    // -- We get the Dialog and assign it to a messages array
    const messagesArray = dialoguesContent.messages[dialogName]
    const IdsArray = []
    // -- Fill the array with the Ids of the BroadCast Messages
    for (const message of messagesArray) {
      const creativeId = await this.getCreativeId(message)
      if (!isNaN(parseInt(creativeId, 10))) {
        IdsArray.push(parseInt(creativeId, 10))
      }
    }
    return IdsArray
  }

  static async getCustomLabelId (label) {
    const labelsIdsArray = (await axios.get(`${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/custom_labels?fields=name&access_token=${process.env.FB_ACCESS_TOKEN}`)).data.data
    for (const labelData of labelsIdsArray) {
      if (labelData.name === label) {
        return labelData.id
      }
    }
  }

  static async sendBroadcastMessage (dialogName, labelToExclude) {

    const creativeIdsArray = await this.prepareCreativeIdsArray(dialogName)
      .catch(() => {
        return 0
      })
    const customLabelId = await this.getCustomLabelId(labelToExclude)
      .catch(() => {
        return 0
      })
    const broadcastIdsList = []
    for (const creativeId of creativeIdsArray) {

      let creativeData
      if (customLabelId) {
        creativeData = Object.assign({},
          {
            // -- NOTE: The creativeId must be an int
            message_creative_id: creativeId,
            notification_type: 'REGULAR',
            targeting: {
              labels: {
                operator: 'NOT',
                values: [customLabelId],
              },
            },
          })
      } else {
        creativeData = Object.assign({},
          {
            // -- NOTE: The creativeId must be an int
            message_creative_id: creativeId,
            notification_type: 'REGULAR',
          })
      }

      // -- Send the message to facebook
      const fromFacebook = await axios.request({
        headers: { 'Content-Type': 'application/json' },
        url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/broadcast_messages?access_token=${process.env.FB_ACCESS_TOKEN}`,
        method: 'post',
        data: JSON.stringify(creativeData),
      })
        .catch(error => {
          console.log('ERROR REQUESTING THE BROADCAST MESSAGE TO BE SEND', error.response.data)
          return 0
        })
      broadcastIdsList.push(fromFacebook.data.broadcast_id)
    }
    return broadcastIdsList
  }

}

module.exports = broadcastSender
