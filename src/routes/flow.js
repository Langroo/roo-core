/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
require('dotenv').config();

/**
 * Local depencencies
 */
const FlowManagment = require('../database/index').FlowManagement;
const flowCollection = mongoose.connection.collection('dialogues');

/**
 * Store in dialogues model
 */

/**
 * POST
 * To create a new dialogues
 * @param {String} conversation_id
 */
router.post('/', async (request, response) => {
  // -- Prepare data
  const { conversation_id } = request.body;
  const { current_pos } = request.body;
  const { prev_pos } = request.body;
  const { next_pos } = request.body;
  const { open_question } = request.body;
  const { current_flow } = request.body;
  const { last_interaction } = request.body;
  const { awaiting_answer } = request.body;
  const { prev_flow } = request.body;

  /**
     * Save data into mongo db
     */
  try {
    const flowCreated = await flowCollection.findOne({ conversation_id });
    if (flowCreated != null || flowCreated != undefined) {
      // -- Flow is already created
      response.status(200);
      return response.json({
        statusMessage: response.statusMessage,
        statusCode: response.statusCode,
        data: flowCreated,
      });
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
    });
    response.status(201);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: create,
    });
  } catch (error) {
    response.status(500);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * PUT
 * To update current_pos
 * @param {String} conversation_id
 * @param {String} current_pos
 * @param {String} open_question
 */
router.put('/', async (request, response) => {
  // -- Prepare data
  const { conversation_id } = request.body;
  const { current_pos } = request.body;
  const { open_question } = request.body;
  const { prev_pos } = request.body;
  const { next_pos } = request.body;
  const { current_flow } = request.body;
  const { last_interaction } = request.body;
  const { awaiting_answer } = request.body;
  const { ready_to_reply } = request.body;
  const { prev_flow } = request.body;
  const updateParams = {};

  if (!current_pos) {
    updateParams.current_pos = current_pos;
  }
  if (!open_question) {
    updateParams.open_question = open_question;
  }
  if (!prev_pos) {
    updateParams.prev_pos = prev_pos;
  }
  if (!next_pos) {
    updateParams.next_pos = next_pos;
  }
  if (!current_flow) {
    updateParams.current_flow = current_flow;
  }
  if (!last_interaction) {
    updateParams.last_interaction = last_interaction;
  }
  if (!awaiting_answer) {
    updateParams.awaiting_answer = awaiting_answer;
  }
  if (!ready_to_reply) {
    updateParams.ready_to_reply = ready_to_reply;
  }
  if (!prev_flow) {
    updateParams.prev_flow = prev_flow;
  }

  /**
     * Update data in mongo db
     */
  try {
    const update = await flowCollection.findOneAndUpdate({ conversation_id }, { $set: updateParams }, { new: true });
    response.status(201);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: update,
    });
  } catch (error) {
    response.status(500);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * GET
 * To get an entire dialogues
 * @param {String} conversation_id
 */
router.get('/:conversation_id', async (request, response) => {
  // -- Prepare data
  const { conversation_id } = request.params;

  /**
     * Retrieve data from mongo db
     */
  try {
    const get = await flowCollection.findOne({ conversation_id });
    response.status(201);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: get,
    });
  } catch (error) {
    response.status(500);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * GET
 * To get an entire dialogues
 */
router.get('/', async (request, response) => {
  /**
     * Retrieve data from mongo db
     */
  try {
    const get = await FlowManagment.retrieve({
      query: {},
      findOne: false,
    });
    response.status(201);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: get,
    });
  } catch (error) {
    response.status(500);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * DELETE
 * To delete an entire dialogues
 * @param {String} conversation_id
 */
router.delete('/:conversation_id', async (request, response) => {
  // -- Prepare data
  const { conversation_id } = request.params;

  /**
     * Delete data from mongo db
     */
  try {
    const _delete = await FlowManagment.delete(conversation_id);
    response.status(201);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: _delete,
    });
  } catch (error) {
    response.status(500);
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null });
  }
});

module.exports = router;
