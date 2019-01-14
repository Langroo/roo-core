/**
 * Global dependencies
 */
const express = require('express');
const router = express.Router();
require('dotenv').config();

/**
 * Local dependencies
 */
const TutorRequestManagement = require('../database/index').TutorRequestManagement;
const redis = require('../cache/index');
const CRM = require('../APIs/google/crm.management');

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param currentCountry
 */
router.post('/cache/currentCountry', async (request, response) => {
  /**
   * Save data in redis
   */
  try {
    // -- Prepare data
    const userHash = request.body.userHash;
    const currentCountry = request.body.currentCountry;
    if (!userHash) {
      throw new Error('Missing parameters');
    }
    if (!currentCountry) {
      throw new Error('Missing parameters');
    }

    const create = await redis.hashSetUser(userHash, 'currentCountry', currentCountry);
    if (!create) {
      throw new Error('Error while creating level');
    }
    const retrieve = await redis.hashGetUser(userHash);
    response.status(201);
    response.statusMessage = 'created';
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    });
  } catch (error) {
    console.error('Unexpected error :: ', error);
    response.status(500);
    response.statusMessage = error.toString();
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param selfDescription
 */
router.post('/cache/selfDescription', async (request, response) => {
  /**
   * Save data in redis
   */
  try {
    // -- Prepare data
    const userHash = request.body.userHash;
    const selfDescription = request.body.selfDescription;
    if (!userHash) {
      throw new Error('Missing parameters');
    }
    if (!selfDescription) {
      throw new Error('Missing parameters');
    }

    const create = await redis.hashSetUser(userHash, 'selfDescription', selfDescription);
    if (!create) {
      throw new Error('Error while creating level');
    }
    const retrieve = await redis.hashGetUser(userHash);
    response.status(201);
    response.statusMessage = 'created';
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    });
  } catch (error) {
    console.error('Unexpected error :: ', error);
    response.status(500);
    response.statusMessage = error.toString();
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param interests
 */
router.post('/cache/interests', async (request, response) => {
  /**
   * Save data in redis
   */
  try {
    // -- Prepare data
    const userHash = request.body.userHash;
    const interests = request.body.interests;
    if (!userHash) {
      throw new Error('Missing parameters: userHash');
    }
    if (!interests) {
      throw new Error('Missing parameters: interests');
    }

    const create = await redis.hashSetUser(userHash, 'interests', interests);
    if (!create) {
      throw new Error('Error while creating level');
    }
    const retrieve = await redis.hashGetUser(userHash);
    response.status(201);
    response.statusMessage = 'created';
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    });
  } catch (error) {
    console.error('Unexpected error :: ', error);
    response.status(500);
    response.statusMessage = error.toString();
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param timeOfDayForCalls
 */
router.post('/cache/timeOfDayForCalls', async (request, response) => {
  /**
   * Save data in redis
   */
  try {
    // -- Prepare data
    const userHash = request.body.userHash;
    const timeOfDayForCalls = request.body.timeOfDayForCalls;
    const restart = request.body.restart;
    if (!userHash) {
      throw new Error('Missing parameters');
    }
    if (!timeOfDayForCalls) {
      throw new Error('Missing parameters');
    }
    if (!restart) {
      throw new Error('Missing parameters');
    }

    // -- Check previous data
    const userCached = await redis.hashGetUser(userHash);
    let timeOfDayForCallsCached = !userCached.timeOfDayForCalls ? [''] : userCached.timeOfDayForCalls.split(',');
    timeOfDayForCallsCached.push(timeOfDayForCalls);

    // -- Check restart option
    if (restart) {
      timeOfDayForCallsCached = [timeOfDayForCalls];
    }

    // -- Save data
    const create = await redis.hashSetUser(userHash, 'timeOfDayForCalls', timeOfDayForCallsCached.join());
    if (!create) {
      throw new Error('Error while creating level');
    }
    const retrieve = await redis.hashGetUser(userHash);
    response.status(201);
    response.statusMessage = 'created';
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    });
  } catch (error) {
    console.error('Unexpected error :: ', error);
    response.status(500);
    response.statusMessage = error.toString();
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param timeOfWeekForCalls
 */
router.post('/cache/timeOfWeekForCalls', async (request, response) => {
  /**
   * Save data in redis
   */
  try {
    // -- Prepare data
    const userHash = request.body.userHash;
    const timeOfWeekForCalls = request.body.timeOfWeekForCalls;
    if (!userHash) {
      throw new Error('Missing parameters');
    }
    if (!timeOfWeekForCalls) {
      throw new Error('Missing parameters');
    }

    const create = await redis.hashSetUser(userHash, 'timeOfWeekForCalls', timeOfWeekForCalls);
    if (!create) {
      throw new Error('Error while creating level');
    }
    const retrieve = await redis.hashGetUser(userHash);
    response.status(201);
    response.statusMessage = 'created';
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    });
  } catch (error) {
    console.error('Unexpected error :: ', error);
    response.status(500);
    response.statusMessage = error.toString();
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param daysOfWeekForCalls
 */
router.post('/cache/daysOfWeekForCalls', async (request, response) => {
  /**
   * Save data in redis
   */
  try {
    // -- Prepare data
    const userHash = request.body.userHash;
    const daysOfWeekForCalls = request.body.daysOfWeekForCalls;
    if (!userHash) {
      throw new Error('Missing parameters');
    }
    if (!daysOfWeekForCalls) {
      throw new Error('Missing parameters');
    }

    const create = await redis.hashSetUser(userHash, 'daysOfWeekForCalls', daysOfWeekForCalls);
    if (!create) {
      throw new Error('Error while creating level');
    }
    const retrieve = await redis.hashGetUser(userHash);
    response.status(201);
    response.statusMessage = 'created';
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    });
  } catch (error) {
    console.error('Unexpected error :: ', error);
    response.status(500);
    response.statusMessage = error.toString();
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

/**
 * MONGO DB Functions
 */

/**
 * POST
 * Create New Tutor Request
 */
router.post('/', async (request, response) => {
  const userHash = request.body.userHash;

  try {
    // -- Retrieve data from redis
    const userCached = await redis.hashGetUser(userHash);
    // -- Prepare data
    const timeOfDayForCalls = userCached.timeOfDayForCalls.split(',').map((value) => {
      value = value.toUpperCase();
      if (!['TFB_MORNING', 'TFB_MORNING_ALT', 'TFB_AFTERNOON', 'TFB_AFTERNOON_ALT', 'TFB_EVENING', 'TFB_EVENING_ALT'].includes(value)) {
        return 'TFB_MORNING';
      }
      return value;
    });

    const tutorRequest = {
      user_id: userCached.senderId,
      current_country: userCached.currentCountry,
      self_description: userCached.selfDescription,
      interests: userCached.interests,
      time_of_day_for_calls: timeOfDayForCalls,
      time_of_week_for_calls: userCached.timeOfWeekForCalls.toUpperCase(),
      days_of_week_for_calls: userCached.daysOfWeekForCalls,
      internet_speed_description: userCached.internet_speed_description || 'Data unavailable for old users',
      other_information: userCached.other_information || 'Data unavailable for old users',
      can_pay: !userCached.other_information || 'Data unavailable for old users',
      date: new Date(),
    };

    let tutorRequestCreated = await TutorRequestManagement.retrieve({
      query: { user_id: userCached.senderId },
      findOne: true,
    });

    // -- Verify if the user has not a tutor request already created
    if (tutorRequestCreated) {
      // The tutor request exists so we update it
      const tutorRequestID = tutorRequestCreated._id;
      tutorRequestCreated = await TutorRequestManagement.update(tutorRequestID, tutorRequest);
      console.log('Tutor request updated successfully in MONGODB');

      // -- Update googlesheets
      await CRM.tutorRequestUpdate()
        .catch(e => console.error('😲 This happened:', e));
      console.log('Tutor request updated in GoogleSheets successfully!');

      response.status(200);
      response.json({
        statusMessage: response.statusMessage,
        statusCode: response.statusCode,
        data: tutorRequestCreated,
      });
    } else {
      // The tutor request does not exist so we create it
      tutorRequestCreated = await TutorRequestManagement.create(tutorRequest);
      console.log('Tutor request created for the first time successfully');

      // -- Update googlesheets
      await CRM.tutorRequestUpdate()
        .catch(e => console.error('😲 This happened:', e));
      console.log('Tutor request created in GoogleSheets successfully!');

      response.status(200);
      response.json({
        statusMessage: response.statusMessage,
        statusCode: response.statusCode,
        data: tutorRequestCreated,
      });
    }
  } catch (reason) {
    console.error('Unexpected error :: ', reason);
    response.statusMessage = 'Internal server error';
    response.status(500);
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    });
  }
});

module.exports = router;
