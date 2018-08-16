const express = require('express')
const router = express.Router()
const broadcastSender = require('../dialogues/dialogues-builder').broadcastSender
const broadcastQuizTools = require('../general').broadcastQuiz

router.post('/', async (request, response) => {
  try {
    const dialogName = request.body.dialogName
    const labelToExclude = request.body.labelToExclude
    if (!dialogName || !labelToExclude) {
      throw new Error('Parameters in request missing')
    }
    // -- Send the broadcast dialog with the messages of the Quiz
    const broadcastId = await broadcastSender.sendBroadcastMessage(dialogName, labelToExclude)
    // -- Lock the user in the Quiz Context to force him to answer
    broadcastQuizTools.setContextInBot()
      .catch(() => console.log('An error occurred setting the users awaiting_answer parameter to 1 for the quiz answer'))
    console.log('\nBroadcast Ids List ::\n', broadcastId)
    response.json({
      statusMessage: 'Broadcast Message Sent Successfully',
      statusCode: 201,
      data: broadcastId,
    })
  } catch (error) {
    response.json({ statusMessage: error.toString(), statusCode: 500, data: null })
  }
})

module.exports = router
