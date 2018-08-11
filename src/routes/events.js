/**
 * ====================================================
 * =============== Events management ==================
 * ====================================================
 *
 * API Description
 *   - Manage all the interactions of every user
 *   - Save and retrieve interactions on database model
 *   - Do metrics calculation
 */


/**
 * Global dependencies
 */
const mongoose = require ('mongoose')
const express = require('express')
const router = express.Router()
const crypto = require('crypto')
require('dotenv').config()

/**
 * DB Instances | Management
 */
const EventsManagement = require('../database/index').EventsManagement
const MetricsManagement = require('../database/index').MetricsManagement

/**
 * DB Instances | Collections
 */
const metricsCollection = mongoose.connection.collection('metric')

/**
 * Controllers and digest
 */
const generateHash = (str) => crypto.createHash('md5').update(str).digest('hex');
const googlesheet = require('../APIs/google')

/**
 * Multipart middleware
 */
const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty();
router.use(multipartyMiddleware);


/**
 * Save daily events per user and calculate metrics
 */
router.post('/daily', async function (request, response, next) {
    /**
     * Data structure
     * dataSet: {
     * [{
     *     senderId:String,
     *     rawInput:String,
     *     isPostback:Boolean,
     *     date:Date,
     * }]
     * }
     */

    //-- Prepare data
    let dataSet = request.body.dataSet;

    /**
     * Do daily events creation
     */
    try {
        //-- Check variable integrity
        if (!dataSet) throw new Error("{dataSet} must be defined")
        if (!(dataSet instanceof Array)) throw new Error("{dataSet} must be an array")

        //-- Build all event schema
        let nEvents = 0;
        for (let event of dataSet) {
            await EventsManagement.create({
                userId: generateHash(event.senderId),
                rawInput: event.rawInput,
                isPostback: event.isPostback,
                date: event.date
            });
            nEvents++;
        }

        //-- Do calculations of the day for tracked_items
        let date = new Date();
        let numberOfEvents = nEvents;
        let numberOfNewUsers = 0;
        let avgOfMessagesPerUser = nEvents / 1 /*Number of users*/;
        let surveysCompleted = 0; /* Calculate */

        //-- Save on db
        let metricSaved = await MetricsManagement.create({
          date,
            numberOfEvents,
            numberOfNewUsers,
            avgOfMessagesPerUser,
            surveysCompleted
        });

        if (!metricSaved) throw new Error("There was an error trying to save on mongodb");

        //-- Save on google sheets
        let metricSheet = new googlesheet("metric")

        //-- Delete from survey
        await metricSheet.delete()

        //-- Save users surveys in googlesheets
        let metricCursor = metricsCollection.find();
        let metric;

        while ( (metric = await metricCursor.next()) )
            await metricSheet.create(metric)

        //-- Return success status
        response.status(201);
        response.statusMessage = "Metrics created successfully"
        response.json({
            statusMessage: response.statusMessage,
            statusCode: response.statusCode,
            data: null
        });
    } catch (error) {
        response.status(500)
        response.statusMessage = "Metrics created error"
        console.log('Error creating metrics [%s] ', error.message)
        response.json({
            statusMessage: response.statusMessage,
            statusCode: response.statusCode,
            data: null
        });
    }
});


module.exports = router;
