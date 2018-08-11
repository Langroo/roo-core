/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
require('dotenv').config()

/**
 * Local depencencies
 */
const FlowManagment = require('../database/index').FlowManagement
const flowCollection = mongoose.connection.collection('dialogs')

/**
 * Store in dialogs model
 */

/**
 * POST
 * To create a new dialogs
 * @param {String} conversation_id
 */
router.post('/', async (request, response) => {
  // -- Prepare data
  const conversation_id = request.body.conversation_id
  const current_pos = request.body.current_pos
  const prev_pos = request.body.prev_pos
  const next_pos = request.body.next_pos
  const open_question = request.body.open_question
  const current_flow = request.body.current_flow
  const last_interaction = request.body.last_interaction
  const awaiting_answer = request.body.awaiting_answer
  const prev_flow = request.body.prev_flow

    /**
     * Save data into mongo db
     */
  try {
    const flowCreated = await flowCollection.findOne({ conversation_id })
    if (flowCreated != null || flowCreated != undefined) {
      // -- Flow is already created
      response.status(200)
      return response.json({
        statusMessage: response.statusMessage,
        statusCode: response.statusCode,
        data: flowCreated,
      })
    }

    const create = await FlowManagment.create({
      conversation_id,
      current_pos,
      prev_pos,
      next_pos,
      open_question,
      current_flow,
      last_interaction,
      awaiting_answer,
      prev_flow,
    })
    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: create,
    })
  } catch (error) {
    response.status(500)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * PUT
 * To update current_pos
 * @param {String} conversation_id
 * @param {String} current_pos
 * @param {String} open_question
 */
router.put('/', async (request, response) => {
  // -- Prepare data
  const conversation_id = request.body.conversation_id
  const current_pos = request.body.current_pos
  const open_question = request.body.open_question
  const prev_pos = request.body.prev_pos
  const next_pos = request.body.next_pos
  const current_flow = request.body.current_flow
  const last_interaction = request.body.last_interaction
  const awaiting_answer = request.body.awaiting_answer
  const ready_to_reply = request.body.ready_to_reply
  const prev_flow = request.body.prev_flow
  const updateParams = {}

  if (!current_pos) {
    updateParams.current_pos = current_pos
  }
  if (!open_question) {
    updateParams.open_question = open_question
  }
  if (!prev_pos) {
    updateParams.prev_pos = prev_pos
  }
  if (!next_pos) {
    updateParams.next_pos = next_pos
  }
  if (!current_flow) {
    updateParams.current_flow = current_flow
  }
  if (!last_interaction) {
    updateParams.last_interaction = last_interaction
  }
  if (!awaiting_answer) {
    updateParams.awaiting_answer = awaiting_answer
  }
  if (!ready_to_reply) {
    updateParams.ready_to_reply = ready_to_reply
  }
  if (!prev_flow) {
    updateParams.prev_flow = prev_flow
  }

    /**
     * Update data in mongo db
     */
  try {
    const update = await flowCollection.findOneAndUpdate({ conversation_id }, { $set: updateParams }, { new: true })
    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: update,
    })
  } catch (error) {
    response.status(500)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * GET
 * To get an entire dialogs
 * @param {String} conversation_id
 */
router.get('/:conversation_id', async (request, response) => {
  // -- Prepare data
  const conversation_id = request.params.conversation_id

    /**
     * Retrieve data from mongo db
     */
  try {
    const get = await flowCollection.findOne({ conversation_id })
    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: get,
    })
  } catch (error) {
    response.status(500)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * GET
 * To get an entire dialogs
 */
router.get('/', async (request, response) => {

    /**
     * Retrieve data from mongo db
     */
  try {
    const get = await FlowManagment.retrieve({
      query: {},
      findOne: false,
    })
    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: get,
    })
  } catch (error) {
    response.status(500)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * DELETE
 * To delete an entire dialogs
 * @param {String} conversation_id
 */
router.delete('/:conversation_id', async (request, response) => {
  // -- Prepare data
  const conversation_id = request.params.conversation_id

    /**
     * Delete data from mongo db
     */
  try {
    const _delete = await FlowManagment.delete(conversation_id)
    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: _delete,
    })
  } catch (error) {
    response.status(500)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

module.exports = router
