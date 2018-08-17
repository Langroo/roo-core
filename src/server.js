// -- GLOBAL Dependencies
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const passport = require('passport')
const path = require('path')
const Bluebird = require('bluebird')
const Raven = require('raven')
require('dotenv').config()
global.Promise = Bluebird

/**
 * LOCAL Dependencies
 */
const slack = require('./general').slack
const cronServices = require('./cron')
const MongoDB = require('./database/connect')
const Redis = require('./cache/connect')
const PaymentController = require('./payment').PaymentController
require('./general').timezone.config()
require('./general').array.config()
require('./general').string.config()

/**
 * Establish DB connection before create server instance
 */
Promise.all([MongoDB, Redis])
.then(async (response) => {
  console.log('---------- CONNECTION SUCCESFULL -----------')
  console.log('Database instances connection established properly')
  console.log(response[0] ? 'MongoDB status :OK:' : 'MongoDB status :FAILED:')
  console.log(response[1] ? 'Redis status :OK:' : 'Redis status :FAILED:')
  console.log('-------------------------------------------\n')

  if (process.env.REFRESH_MODE === 'true' || process.env.REFRESH_MODE === '1') {
    console.log('-------------- CREATING PAYMENT PLANS -----------------')
    await PaymentController.createPlans()
      .catch(e => console.error(e))
    console.log('----------- PAYMENT PLANS CREATED SUCCESSFULLY ------------')
  }

  // Configure and install the raven
  Raven.config('https://96d6795013a54f8f852719919378cc59@sentry.io/304046').install()

  // -- Start Express server instance
  const app = express()
  app.set('port', process.env.PORT || 5000)

  // -- View engine setup
  app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'home',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
  }))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'hbs')

  // -- Middlewares management
  app.use(morgan('combined'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true,
  }))

  app.use(passport.initialize())
  app.use(passport.session())
  app.use('/static', express.static(path.join(__dirname, 'public')))

  // -- Load global app variables
  app.locals.COMPANY_NAME = process.env.COMPANY_NAME
  app.locals.FB_PAGE_URL = process.env.FB_PAGE_URL

  // -- Connect passport
  require('./APIs/facebook').auth(passport)

  // -- Routes management
  const routes = require('./routes')

  app.use('/', routes.main)
  app.use('/privacy-policy', routes.main)
  app.use('/oauth', routes.oauth)
  app.use('/user', routes.user)
  app.use('/facebook', routes.facebook)
  app.use('/dialogues', routes.flow)
  app.use('/payment', routes.payment)
  app.use('/tutor-request', routes.tutorRequest)
  app.use('/broadcast', routes.broadcastMessages)

  // Where's my app running
  await new Promise((resolve) => {
    app.listen(app.get('port'), () => {
      console.log('------------- API INFORMATION -------------')
      console.log('API running on port', app.get('port'))
      console.log('-------------------------------------------\n')
      resolve()
    })
  })

  cronServices.messagesMaintenance()
  cronServices.UpdateLastInteractionCron()
  cronServices.LabelCreationCron()
  await cronServices.MainCronJob()
  cronServices.SurveyToGoogleSheetsCron()
})
.catch(reason => {
  slack.notifyError(reason, 'server.js')
  console.log('An error occurred trying to connect to database instances')
  console.log('Details :: ', reason)
  Raven.captureException(reason)
})
