/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const cronjobScheduler = require('node-schedule')
const crypto = require('crypto')
const slack = require('../general/index').slack
const basicSender = require('../dialogues/dialogues-builder').basicSender
require('dotenv').config()

/**
 * Local depencencies
 */
const ContentSystem = require('../cron/content')
const FacebookUsers = require('../APIs/facebook/index').users
const CRM = require('../APIs/google/crm.management')

/**
 * DB Instances | Management
 */
const UsersManagement = require('../database/index').UsersManagement
const UsersMetadataManagement = require('../database/index').UsersMetadataManagement
const PronunciationManagement = require('../database/index').PronunciationManagement
const AnalyticsManagement = require('../database/index').AnalyticsManagement

/**
 * DB Instances | Collections
 */
const userCollection = mongoose.connection.collection('user')
const userMetadataCollection = mongoose.connection.collection('user-metadata')
const scheduleCollection = mongoose.connection.collection('schedule')
const tutorRequestCollection = mongoose.connection.collection('tutor_request')

/**
 * Controllers and digest
 */
const PaymentController = require('../payment/index').PaymentController
const generateHash = (str) => crypto.createHash('md5').update(str).digest('hex')
const redis = require('../cache/index')
const facebookApi = require('../APIs/facebook').apiCalls

/**
 * AWS Bucket
 */
const fs = require('fs')
const AWS = require('aws-sdk')

/**
 * Multipart middleware
 */
const multiparty = require('connect-multiparty')
const multipartyMiddleware = multiparty()

/**
 * AWS S3 Bucket Account
 * With default values
 */
const bucketName = process.env.AWS_BUCKET_NAME || 'langroo-bucket'
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY || 'AKIAJZVLRG3FP72774NQ',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
})

/**
 * CACHE Functions
 * REDIS help us
 */
router.use(multipartyMiddleware)

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param senderId
 */
router.post('/cache/senderId', async (request, response, next) => {
    /**
     * Save data in redis
     */
  try {
    // -- Prepare data
    const userHash = request.body.userHash
    const senderId = request.body.senderId
    if (!userHash) {
      throw new Error('Missing parameters')
    }
    if (!senderId) {
      throw new Error('Missing parameters')
    }

    const create = await redis.hashSetUser(userHash, 'senderId', senderId)
    if (!create) {
      throw new Error('Error while creating level')
    }
    const retrieve = await redis.hashGetUser(userHash)
    response.status(201)
    response.statusMessage = 'created'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    })
  } catch (error) {
    response.status(500)
    response.statusMessage = error.toString()
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param level
 */
router.post('/cache/level', async (request, response, next) => {
    /**
     * Save data in redis
     */
  try {
    // -- Prepare data
    const userHash = request.body.userHash
    const level = request.body.level
    if (!userHash) {
      throw new Error('Missing parameters')
    }
    if (!level) {
      throw new Error('Missing parameters')
    }

    const create = await redis.hashSetUser(userHash, 'level', level)
    if (!create) {
      throw new Error('Error while creating level')
    }
    const retrieve = await redis.hashGetUser(userHash)
    response.status(201)
    response.statusMessage = 'created'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    })
  } catch (error) {
    response.status(500)
    response.statusMessage = error.toString()
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param sourceFrom
 */
router.post('/cache/sourceFrom', async (request, response, next) => {
    /**
     * Save data in redis
     */
  try {
    // -- Prepare data
    const userHash = request.body.userHash
    const sourceFrom = request.body.sourceFrom
    if (!userHash) {
      throw new Error('Missing parameters')
    }
    if (!sourceFrom) {
      throw new Error('Missing parameters')
    }

    const create = await redis.hashSetUser(userHash, 'sourceFrom', sourceFrom)
    if (!create) {
      throw new Error('Error while creating level')
    }
    const retrieve = await redis.hashGetUser(userHash)
    response.status(201)
    response.statusMessage = 'created'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    })
  } catch (error) {
    response.status(500)
    response.statusMessage = error.toString()
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * POST
 * To save temporal (key val) data of a user
 * @param userName
 * @param sourceValue
 */
router.post('/cache/sourceValue', async (request, response, next) => {
    /**
     * Save data in redis
     */
  try {
    // -- Prepare data
    const userHash = request.body.userHash
    const sourceValue = request.body.sourceValue
    if (!userHash) {
      throw new Error('Missing parameters')
    }
    if (!sourceValue) {
      throw new Error('Missing parameters')
    }

    const create = await redis.hashSetUser(userHash, 'sourceValue', sourceValue)
    if (!create) {
      throw new Error('Error while creating level')
    }
    const retrieve = await redis.hashGetUser(userHash)
    response.status(201)
    response.statusMessage = 'created'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    })
  } catch (error) {
    response.status(500)
    response.statusMessage = error.toString()
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * POST set ready to reply
 */
router.post('/cache/readyToReply', async (request, response, next) => {
    /**
     * Retrieve data from redis
     */
  try {
    // -- Prepare data
    const userHash = request.body.userHash
    const readyToReply = request.body.readyToReply
    if (!userHash) {
      throw new Error('Missing parameters')
    }
    if (!readyToReply) {
      throw new Error('Missing parameters')
    }

    const create = await redis.hashSetUser(userHash, 'readyToReply', readyToReply)
    if (!create) {
      throw new Error('Error while creating level')
    }
    const retrieve = await redis.hashGetUser(userHash)
    response.status(201)
    response.statusMessage = 'retrieved'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: retrieve,
    })
  } catch (error) {
    response.status(500)
    response.statusMessage = error.toString()
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * GET
 * @return Retrieve entire user cache
 */
router.get('/cache/:userHash', async (request, response, next) => {
  try {
    // -- Prepare data
    const userHash = request.params.userHash
    if (!userHash) {
      throw new Error('Missing parameters')
    }

    const user = await redis.hashGetUser(userHash)
    response.status(201)
    response.statusMessage = 'retrieved'
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: user })
  } catch (error) {
    response.status(500)
    response.statusMessage = error.toString()
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

// ----------------------------------------------------------------------
/**
 * MONGO DB Functions
 */

/**
 * PUT
 * User wrote [on demand content based]
 * @param conversation_id
 */
router.put('/wrote', async (request, response) => {
  try {
    // -- Prepare data
    const senderId = request.body.senderId
    if (!senderId) {
      throw new Error('ಠ_ಠ {senderId} not properly setup')
    }
    const userHash = generateHash(senderId)
    const senderWeekResult = await ContentSystem.senderWeek(userHash)
      .catch(err => {
        console.error('Massive ERROR at /wrote after calling ContentSystem.senderWeek :: ', err)
        throw new Error(err)
      })
    response.status(senderWeekResult.statusCode)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  } catch (reason) {
    console.log('ERROR :: (╯°□°）╯︵ ┻━┻ IN /user/wrote 👇\n', reason)
    response.status(500)
    response.json({ statusMessage: reason, statusCode: response.statusCode, data: null })
  }
})

/**
 * PUT
 * To update the conversation ID and save it into the database
 * @param userID => facebook user identifier
 * @param conversationID => facebook user => app, conversation identifier
 */
router.put('/conversationID', (request, response) => {
  // -- Prepare data
  const userId = request.body.userId
  const conversationID = request.body.conversationID

  // -- Query and update DB
  UsersManagement.update(userId, { conversationID })
    .then(() => {
      response.status(200)
      response.json({ state: true, message: 'User conversation ID has been updated correctly' })
    })
    .catch((reason) => {
      console.log(reason)
      response.status(500)
      response.json({ state: false, message: reason })
    })
})

router.post('/update_context', async (request, response) => {
  try {
    // -- Prepare data
    const senderId = request.body.senderId
    const paramsToUpdate = request.body.parameters

    // -- Check that parameters are set
    if (!senderId) {
      throw 'ERROR :: You forgot to send me the SENDERID, genius!'
    } else if (!paramsToUpdate) {
      throw 'ERROR :: What the fuck am I supposed to update if you do not send me the PARAMETERS!'
    }

    const metadataId = generateHash(senderId)

    if (paramsToUpdate.finished_flows) {
      UsersMetadataManagement.update(metadataId, { $addToSet: { finished_flows: paramsToUpdate.finished_flows } }, true)
        .then(() => {
          response.status(200)
          response.json({ state: true, message: 'Good job! The user\'s finished_flows was updated successfully.' })
        })
        .catch((reason) => {
          console.log(reason)
          response.status(500)
          response.json({ state: false, message: reason })
        })
    }
    if (paramsToUpdate.last_position) {
      UsersMetadataManagement.update(metadataId, { last_position: paramsToUpdate.last_position }, true)
        .then(() => {
          response.status(200)
          response.json({ state: true, message: 'Good job! The user\'s last_position was updated successfully.' })
        })
        .catch((reason) => {
          console.log(reason)
          response.status(500)
          response.json({ state: false, message: reason })
        })
    }
    if (!paramsToUpdate.last_position && !paramsToUpdate.finished_flows) {
      throw 'ERROR :: This endpoint is for the bloody LAST_POSITION or the bloody FINISHED_FLOWS. You sent neither of them!'
    }
  } catch (e) {
    console.log(e)
    response.status(500)
    response.json({ state: false, message: e })
  }
})

/**
 * MONGODB:: Update the profile of the user depending on targetCollection
 * If targetCollection === user then it is the user collection
 * If targetCollection === metadata then it is the metadata collection
 * Both collections comprise the whole user profile
 * */
router.post('/update_user', (request, response) => {
  // -- Prepare data
  const senderId = request.body.senderId
  const paramsToUpdate = request.body.parameters
  const targetCollection = request.body.destination

  if (targetCollection === 'user') {
    UsersManagement.update(senderId, paramsToUpdate)
      .then(() => {
        response.status(200)
        response.json({ state: true, message: 'Good job! This user\'s profile was updated successfully.' })
      })
      .catch((reason) => {
        console.log(reason)
        response.status(500)
        response.json({ state: false, message: reason })
      })
  } else if (targetCollection === 'metadata') {
    UsersMetadataManagement.update(senderId, paramsToUpdate)
      .then(() => {
        response.status(200)
        response.json({ state: true, message: 'Good job! This user\'s metadata was updated successfully.' })
      })
      .catch((reason) => {
        console.log(reason)
        response.status(500)
        response.json({
          state: false,
          message: reason,
        })
      })
  } else {
    throw new Error('ERROR :: (╯°□°）╯︵ ┻━┻  TARGET COLLECTION TO UPDATE NOT SPECIFIED')
  }
})

/**
 * PUT
 * MONGODB:: Updates the level of the user AND resets his content to the first day/lesson/week/whateverTheCEOWants
 * @param conversation_id
 * @param level => level [beginner, intermediate, advanced]
 */
router.put('/level', async (request, response) => {
  try {
    // -- Prepare data
    const conversation_id = request.body.conversation_id
    const level = request.body.level

    if (!level || !conversation_id) {
      throw 'ERROR :: Where the fuck is the LEVEL and the CONVERSATION_ID, do you think this is a game?!'
    }

    const user = await UsersManagement.findAndUpdate({ senderId: conversation_id }, { 'content.plan.level': level })
    await UsersManagement.findAndUpdate({ senderId: conversation_id }, {
      'content.current': {
        lesson: 0,
        message: 0,
        until_lesson: 10,
      },
    })
    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: user,
    })
  } catch (reason) {
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
 * MONGODB:: Updates the accent of the user AND resets his content to the first day/lesson/week/whateverTheCEOWants
 * @param userID => facebook user identifier
 * @param accent => level [us, uk]
 */
router.put('/accent', async (request, response) => {
  try {
    // -- Prepare data
    const accent = request.body.accent
    const conversation_id = request.body.conversation_id

    if (!accent || !conversation_id) {
      throw 'ERROR :: Where the fuck is the ACCENT and the CONVERSATION_ID, do you think this is a game?!'
    }

    const user = await UsersManagement.findAndUpdate({ senderId: conversation_id }, { 'content.plan.accent': accent })
    await UsersManagement.findAndUpdate({ senderId: conversation_id }, {
      'content.current': {
        lesson: 0,
        message: 0,
        until_lesson: 10,
      },
    })
    response.status(201)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: user })
  } catch (reason) {
    console.log('ERROR :: (╯°□°）╯︵ ┻━┻ IN /user/accent 👇\n', reason)
    response.status(500)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

/**
 * PUT
 * To update the subscription and save it into the database
 * @param conversation_id => facebook sender id
 * @param product
 */
router.put('/subscription', async (request, response) => {
  try {
    // -- Prepare data
    const conversation_id = request.body.conversation_id
    const product = request.body.product
    const status = request.body.status
    const weeks_paid = request.body.weeks_paid

    // -- Updating
    if (!conversation_id) {
      throw 'ERROR :: The CONVERSATION_ID is UNDEFINED you asshole!'
    }

    if (!product) {
      await UsersManagement.findAndUpdate({ senderId: conversation_id }, { 'subscription.product': product })
    }
    if (!status) {
      await UsersManagement.findAndUpdate({ senderId: conversation_id }, { 'subscription.status': status })
    }
    if (!weeks_paid) {
      await UsersManagement.findAndUpdate({ senderId: conversation_id }, { 'subscription.weeks_paid': weeks_paid })
    }

    response.status(201)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  } catch (reason) {
    console.log('ERROR :: (╯°□°）╯︵ ┻━┻ IN /user/subscription 👇\n', reason)
    response.status(500)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

/**
 * GET USER
 */
router.get('/:senderId', async (request, response, next) => {
  // -- Prepare data
  const senderId = request.params.senderId
  const userHash = generateHash(senderId)
  console.log('Getting user data [%s]', senderId)

  // -- Get user full profile from Mongo
  try {
    const userMgt = await UsersManagement.retrieve({ query: { senderId }, findOne: true })
    if (!userMgt) {
      throw new Error(`User with id [${senderId}] does not exist`)
    }

    // -- Check if user has metadata
    const userMetadata = await userMetadataCollection.findOne({ _id: userHash })
    let userData

    if (userMetadata) {
      const getCursor = userCollection.aggregate([
        { $match: { _id: userMgt._id } },
        { $lookup: { from: 'user-metadata', localField: '_id', foreignField: '_id', as: 'user-metadata' } },
        { $unwind: '$user-metadata' },
        {
          $project: {
            _id: 1,
            name: 1,
            gender: 1,
            language: 1,
            location: 1,
            payment: 1,
            FirstSubscriptionDate: 1,
            subscription: 1,
            senderId: 1,
            source_type: '$user-metadata.source_type',
            source_name: '$user-metadata.source_name',
            motivation_to_learn_english: '$user-metadata.motivation_to_learn_english',
            answers_to_content: '$user-metadata.answers_to_content',
          },
        },
      ])
      userData = await getCursor.next()
    } else {
      userData = userMgt
    }

    if (!userData) {
      throw new Error('Error pairing User Profile with User Metadata')
    }
    response.status(201)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: userData })
  } catch (error) {
    response.status(500)
    response.statusMessage = 'Error: User with that senderId was not found'
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

/**
 * POST USER
 * REGISTER USER - CREATE NEW USER PROFILE INCLUDING USER AND METADATA
 * CREATE THE CONTENT SCHEDULE FOR THE FIRST TIME
 * CREATE THE REMINDERS FOR THE FIRST TIME
 */
router.post('/', async (request, response) => {
  // -- Prepare data
  const senderId = request.body.senderId

  // -- Create user
  try {
    // -- Check variable integrity
    if (!senderId) {
      throw new Error('Sender ID must be defined')
    }

    // -- Get user information
    const userHash = generateHash(senderId)

    // -- Request public profile from Facebook using Facebook API
    let fbUser = await FacebookUsers.getUserPublicInformation(senderId)
      .catch(err => {
        console.error('FUCKING FACEBOOK DID NOT PROVIDE USER PUBLIC PROFILE CUZ THIS :: ', err)
        fbUser = Object.assign({
          first_name: 'MISSING INFO',
          last_name: 'MISSING INFO',
          gender: 'MISSING INFO',
          profile_pic: 'MISSING INFO',
          locale: 'MISSING INFO',
          timezone: 0,
        })
        slack.notifyError(`Error in getUserPublicInformation()\nFacebook DID not give us the user public profile\nERROR :: ${err}`, 'getUserPublicInformation() in routes/index.js\nLine 979')
      })

    const userCache = await redis.hashGetUser(userHash)
      .catch(err => console.error('ERROR :: Could not retrieve user cache\nLine :: 729'))

    // -- Build user schema
    let user = {
      _id: userHash,
      senderId: userCache.senderId,
      name: {
        full_name: `${fbUser.first_name} ${fbUser.last_name}`,
        first_name: fbUser.first_name,
        last_name: fbUser.last_name,
        short_name: fbUser.first_name,
      },
      picture: fbUser.profile_pic,
      gender: fbUser.gender,
      language: fbUser.locale,
      location: {
        id: null,
        name: null,
        locale: fbUser.locale,
        timezone: fbUser.timezone,
      },
      payment: {
        status: 'in_debt',
      },
      subscription: {
        product: 'FREE CONTENT',
        status: 'ACTIVE',
        weeks_paid: 2,
      },
      FirstSubscriptionDate: new Date().toUserTimezone(fbUser.timezone),
    }

    // -- Define the userMetadata object that will be sent
    const userMetadata = {
      _id: userHash,
      source_type: userCache.source_type || 'Not Provided',
      source_name: userCache.source_name || 'Not Provided',
      age: userCache.age || 'Not Provided',
      motivation_to_learn_english: userCache.motivation_to_learn_english || 'Not Provided',
      current_job: userCache.current_job || 'Not Provided',
      subjects_studying: userCache.subjects_studying || 'Not Provided',
      exam_studying: userCache.exam_studying || 'Not Provided',
      biggest_interests_personal: userCache.biggest_interests_personal || 'Not Provided',
      favorite_city: userCache.favorite_city || 'Not Provided',
      internet_speed: userCache.internet_speed || 'Not Provided',
      ad_referral: userCache.ad_referral || 'Not Provided',
      delay_time_between_messages: !isNaN(parseInt(userCache.delay_time_between_messages, 10)) ? parseInt(userCache.delay_time_between_messages, 10) : 1.0,
      response_time: !isNaN(parseInt(userCache.response_time, 10)) ? parseInt(userCache.response_time, 10) : 1.0,
      answers_to_content: userCache.answers_to_content || 'Not Provided',
    }

    // -- Check if user is already registered
    const userExist = await UsersManagement.retrieve({ query: { senderId }, findOne: true })
    if (!userExist) {
      // -- User is already registered | UPDATE
      delete user._id
      user.customerId = userExist.customerId
      user = await UsersManagement.update(userHash, user)

    } else {
      // -- User does not exist | CREATE
      await UsersManagement.create(user, { updateIfExist: true })
      user = await UsersManagement.retrieve({ query: { _id: user._id }, findOne: true })
    }

    // -- Check if user metadata exist or not
    const userMetadataExist = await UsersMetadataManagement.retrieve({ query: { _id: userHash }, findOne: true })
    if (userMetadataExist) {
      // -- User metadata is already registered | UPDATE
      delete userMetadata._id
      await UsersMetadataManagement.findAndUpdate({ _id: userHash }, userMetadata)
        .catch(err => console.error('Unable to update user metadata profile :: ', err))

    } else {
      // -- User metadata does not exist | CREATE
      await UsersMetadataManagement.create(userMetadata, { updateIfExist: true })
        .catch(err => console.error('Unable to create user metadata profile :: ', err))
    }

    // -- Update google sheets
    await CRM.addNewProfileRecord(senderId)

    // -- Remove user from the UNREGISTERED LABEL
    await facebookApi.removeUserFromLabel(senderId, 'UNREGISTERED')
      .catch(err => console.log(err))

    // -- Assign the user to the label
    await facebookApi.assignUserToLabel(senderId, 'ACTIVE')
      .catch(err => console.log(err))

    // -- Return created user
    response.status(201)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: user })
  } catch (error) {
    response.status(500)
    console.log('Error creating user after introduction :: ', error)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

/**
 * DELETE USER
 * -----------
 */
router.put('/', async (request, response) => {
  // -- Prepare data
  const senderId = request.body.senderId

    /**
     * Do user creation
     */
  try {
    // -- Check variable integrity
    if (!senderId) {
      throw new Error('Sender ID must be defined')
    }

    // -- Delete User
    let user = await userCollection.findOne({ senderId })
    if (!user) {
      throw new Error('User does not exist')
    }
    console.info('✴ User subscription data deletion STARTED ✴')

    // -- Delete user itself | Change status to unsubscribed
    const previousStatus = user.subscription.status
    user = await UsersManagement.findAndUpdate({ senderId }, {
      'payment.status': 'in_debt',
      'subscription.product': 'FREE CONTENT',
      'subscription.status': 'UNSUBSCRIBED',
    })
    console.info('User status set to UNSUBSCRIBED successfully')
    // -- Delete user payment subscription
    await PaymentController.deleteSubscription(senderId)
    console.info('User payment subscriptions deleted successfully')
    // -- Delete schedule program
    const scheduleCursor = scheduleCollection.find({ send_to: user._id })
    let schedule
    while ((schedule = await scheduleCursor.next()) != null) {
      if (schedule.cronjob_status) {
        if (cronjobScheduler.scheduledJobs[schedule._id]) {
          cronjobScheduler.scheduledJobs[schedule._id].cancel()
          console.info('User content job [%s] cancelled successfully', schedule._id)
        }
      }
    }
    await scheduleCollection.deleteOne({ send_to: user._id })
    console.info('User scheduled content deleted successfully')

    // -- Delete tutor requests
    await tutorRequestCollection.deleteOne({ user_id: user._id })
    console.info('User tutor requests deleted successfully')
    // -- Return deleted user
    console.info('✔ User subscription data deletion COMPLETE ✔')

    // -- Remove the user from the last Status Label he had
    await facebookApi.removeUserFromLabel(senderId, previousStatus)
      .catch(err => console.log(err))

    // -- Assign the user to the label
    await facebookApi.assignUserToLabel(senderId, 'UNSUBSCRIBED')
      .catch(err => console.log(err))

    response.status(201)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: user,
    })
  } catch (error) {
    response.status(500)
    console.log('Error deleting user :: ', error)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * Create file
 */
router.post('/pronunciationFile', async (request, response) => {
  // -- Get file purposes
  const file = request.files.file
  const stream = fs.createReadStream(file.path)
  const name = `${Date.now()}-${file.originalFilename}`
  s3.putObject({
      Bucket: bucketName, // bucket name on which file to be uploaded
      Key: name,
      ContentType: 'audio/mpeg',
      Body: stream, // base-64 file stream
      ACL: 'public-read',  // public read access
    }, async (err, resp) => {
      if (err) {  // if there is any issue
        console.log('Error saving file into AWS bucket :: ', err)
        response.status(500)
        return response.json({
          statusMessage: response.statusMessage,
          statusCode: response.statusCode,
          data: null,
        })
      }
      // -- Form the url
      response.statusMessage = 'Pronunciation file saved on AWS successfully'
      const fileUrl = `https://s3.amazonaws.com/${bucketName}/${name}`

      // -- Save data on DB if it is possible
      const senderId = request.body.senderId
      const user_id = generateHash(senderId || '')
      const statement = request.body.statement
      const date = new Date()
      const url = fileUrl
      let pronunciation = null

      if (user_id && statement && date && url) {
        // -- Check if the user is on DB
        const user = await userCollection.findOne({ _id: user_id })
        if (user) {
          // -- Save everything in mongo
          pronunciation = await PronunciationManagement.create({
            user_id,
            statement,
            date,
            url,
          })
          response.statusMessage = 'Pronunciation file saved on AWS and saved on DB successfully'
        } else {
          // -- User does not exist
          response.statusMessage = 'Pronunciation file saved successfully on AWS and failed on DB [user does not exists]'
        }
      }
      console.log('response from S3: ', resp)
      response.status(200)
      return response.json({
        statusMessage: response.statusMessage,
        statusCode: response.statusCode,
        data: { fileUrl, pronunciation },
      })
    },
      )
})

router.post('/initRegister', async (request, response) => {
  // -- Prepare data
  const senderId = request.body.senderId

  /**
   * Do user creation
   */
  try {
    // -- Check variable integrity
    if (!senderId) {
      throw new Error('Sender ID must be defined')
    }

    // -- Get user information
    const userHash = generateHash(senderId)
    let fbUser = await FacebookUsers.getUserPublicInformation(senderId)
      .catch(err => {
        console.error('FUCKING FACEBOOK DID NOT PROVIDE USER PUBLIC PROFILE CUZ THIS :: ', err)
        fbUser = Object.assign({
          first_name: 'MISSING INFO',
          last_name: 'MISSING INFO',
          gender: 'MISSING INFO',
          profile_pic: 'MISSING INFO',
          locale: 'MISSING INFO',
          timezone: 0,
        })
        slack.notifyError(`Error in getUserPublicInformation()\nFacebook DID not give us the user public profile\nERROR :: ${err}`, 'getUserPublicInformation() in routes/index.js\nLine 979')
      })

    // -- Build user schema
    let user = {
      _id: userHash,
      senderId,
      name: {
        full_name: `${fbUser.first_name} ${fbUser.last_name}`,
        first_name: fbUser.first_name,
        last_name: fbUser.last_name,
        short_name: fbUser.first_name,
      },
      picture: fbUser.profile_pic,
      gender: fbUser.gender,
      language: fbUser.locale,
      location: {
        id: null,
        name: null,
        locale: fbUser.locale,
        timezone: fbUser.timezone,
      },
      payment: {
        status: 'in_debt',
      },
      subscription: {
        product: 'FREE CONTENT',
        status: 'UNREGISTERED',
        weeks_paid: 2,
      },
      FirstSubscriptionDate: new Date().toUserTimezone(fbUser.timezone),
    }

    // -- Check if user is already registered
    const userExist = await UsersManagement.retrieve({ query: { senderId }, findOne: true })
    if (userExist) {
      // -- User is already registered | UPDATE
      const userId = user._id
      delete user._id
      user.customerId = userExist.customerId
      user = await UsersManagement.findAndUpdate({ _id: userId }, user)

    } else {
      // -- User does not exist | CREATE
      await UsersManagement.create(user, { updateIfExist: true })
      user = await UsersManagement.retrieve({ query: { _id: user._id }, findOne: true })
    }

    // -- Assign the user to the label
    await facebookApi.assignUserToLabel(senderId, 'UNREGISTERED')
      .catch(err => console.log(err))

    // -- Return created user
    response.status(201)
    response.statusMessage = 'Good job! The pretty little user\'s basic data was saved successfully'
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: user })

  } catch (error) {
    slack.notifyError(`Error in getUserPublicInformation()\nFacebook DID not give us the user public profile\nERROR :: ${error}`, 'getUserPublicInformation() in routes/index.js\nLine 979')
    response.status(500)
    response.statusMessage = 'User created error'
    console.log('Error creating user after introduction :: ', error)
    response.json({ statusMessage: response.statusMessage, statusCode: response.statusCode, data: null })
  }
})

/**
 * Save survey
 */
router.post('/saveSurvey', async (request, response) => {
  // -- Prepare data
  const senderId = request.body.senderId

    /**
     * Do user creation
     */
  try {
    // -- Check variable integrity
    if (!senderId) {
      throw 'ERROR :: Where the fuck is my SENDERID?!'
    }

    // -- Get user information and redis data
    const userHash = generateHash(senderId)
    const user = await userCollection.find({ _id: userHash })
    const userCache = await redis.hashGetUser(userHash)

    // -- Check user integrity
    if (!user) {
      throw new Error('User does not exist')
    }
    if (!userCache) {
      throw new Error('User cache does not exist')
    }

    // -- Find and save active questions
    const questions = {
      importance: userCache.importance || 'Not provided yet',
      problem: userCache.problem || 'Not provided yet',
      help: userCache.help || 'Not provided yet',
      most_important1: userCache.most_important1 || 'Not provided yet',
      currently_using: userCache.currently_using || 'Not provided yet',
      likes_dislikes: userCache.likes_dislikes || 'Not provided yet',
      most_important2: userCache.most_important2 || 'Not provided yet',
      friend_idea: userCache.friend_idea || 'Not provided yet',
      correction_idea: userCache.correction_idea || 'Not provided yet',
      join_community: userCache.join_community || 'Not provided yet',
    }

    for (const questionKey of Object.keys(questions)) {
      await AnalyticsManagement.create({
        user_id: userHash,
        type: 'survey',
        key: questionKey,
        value: questions[questionKey],
        sentence: questions[questionKey],
        createdAt: new Date(),
      })
    }

    // -- Save on google sheets
        // CRM.surveyUpdate()

    // -- Return created analytics
    response.status(201)
    response.statusMessage = 'Good job! The analytics collection was created successfully, thus, the survey data was saved.'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  } catch (error) {
    response.status(500)
    response.statusMessage = 'ERROR :: There was a fucking error saving the users bloody survey data!'
    console.error('Error creating analytics (survey-storing-collection) [%s] ', error.message)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * USER RESPOND RATING SYSTEM
 * ------ RATING SYSTEM --------
 */
router.post('/ratingSystemRespond', async (request, response, next) => {
  // -- Prepare data
  const senderId = request.body.senderId

    /**
     * Do user creation
     */
  try {
    // -- Check variable integrity
    if (!senderId) {
      throw new Error('Sender ID must be defined')
    }

    // -- Get user information
    const userHash = generateHash(senderId)
    const userCache = await redis.hashGetUser(userHash)

    if (!userCache) {
      throw new Error({ message: 'User does not have an associated register on REDIS' })
    }

    // -- Get data to update
    const ratingValue = userCache.rating_value
    if (isNaN(parseInt(ratingValue, 10))) {
      throw new Error('Rating value must be a valid number')
    }

    // -- Update user metadata
    const userMetadata = await UsersMetadataManagement.retrieve({ query: { _id: userHash }, findOne: true })
    if (!userMetadata) {
      throw new Error({ message: 'User does not have a metadata associated' })
    }
    await UsersMetadataManagement.findAndUpdate({ _id: userHash }, { rating_value: parseInt(ratingValue, 10) })

    // -- Delete rating schedule register
    await scheduleCollection.deleteOne({ send_to: userHash, type: 'rating-system' })

    // -- Find user
    const user = (await userCollection.findOne({ senderId }))

    // -- Delete reminder cronjob
    const cron = cronjobScheduler.scheduledJobs[`user-rating-${user._id}`]
    if (cron) {
      cron.cancel()
    }

    // -- Send last message [Thank you message]
    const messageBuilder = new basicSender(user.senderId)
    await messageBuilder.sendMessages([
      { type: 'text', content: `WOJO! Great job ${user.name.short_name}, I will forward your rating to my team` },
    ])

    // -- Update google sheets
    CRM.profileFullUpdate()

    // -- Return created user
    response.status(201)
    response.statusMessage = 'User rating system created successfully'
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  } catch (error) {
    response.status(500)
    console.log('Error updating user rating value :: ', error)
    response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

module.exports = router
