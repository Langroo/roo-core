const express = require('express')
const router = express.Router()
const broadcastSender = require('../dialogs/dialogs-builder').broadcastSender

router.post('/', async (request, response) => {
  try {
    const dialogName = request.body.dialogName
    const labelToExclude = request.body.labelToExclude
    if (!dialogName || !labelToExclude) {
      throw new Error('Parameters in request missing')
    }
    const broadcastId = await broadcastSender.sendBroadcastMessage(dialogName, labelToExclude)
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
