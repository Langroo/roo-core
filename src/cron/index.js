const scheduler = require('node-schedule')
const CRM = require('../APIs/google/crm.management')

const SheetsToMongo = require('./sheets-to-mongo')
const UserActions = require('./user-actions')
const apiCalls = require('../APIs/facebook/index').apiCalls
const broadcastSender = require('../dialogues/dialogues-builder').broadcastSender
const broadcastQuizTools = require('../general').broadcastQuiz
const messagesManagement = require('../database/messages').management

// -- Check if the messages collection is created
module.exports.messagesMaintenance = async () => {
  const messagesExist = await messagesManagement.retrieve()
  if (messagesExist.length === 0) {
    const newMessage = {
      position_in_dialogue: '0',
      dialogue_name: 'helloWorld',
      content: 'Hello World!',
      type: 'text',
      category: 'reply',
    }
    messagesManagement.create(newMessage)
  }
}

// -- Main scheduled job that updates the profile and parses GoogleSheets to Mongo
module.exports.MainCronJob = async () => {
  let profileFullUpdateCronTime

  if (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1') {
    profileFullUpdateCronTime = '*/5 * * * *'
  } else {
    profileFullUpdateCronTime = '0 0,14 * * *'
  }

  // -- Save google sheets CRM to mongo (Initial data loading)
  console.log('----------- CRONJOB INFORMATION -----------')

  // -- Content DB refresh
  await SheetsToMongo.execute()
    .catch(() => console.error('Error uploading GoogleSheets content to MongoDB'))
  await CRM.tutorRequestUpdate()
    .catch(() => console.error('Error downloading tutor requests data from MongoDB to GoogleSheets'))

  // -- CRM Refresh MODE when a big change has been made to the API
  if (process.env.REFRESH_MODE === 'true' || process.env.REFRESH_MODE === '1') {

    await CRM.profileFullUpdate()
      .catch(e => console.error('\nError downloading users full profile data from MongoDB to GoogleSheets :: ', e))
      .then(async () => {
        await CRM.surveyUpdate()
          .catch(err => console.error('\nError downloading surveys data from MongoDB to GoogleSheets :: ', err))
      })

  }

  // -- Google Sheets to Mongo cronjob
  scheduler.scheduleJob('Sheets-To-Mongo and CRM Profile Refresher Cronjob', profileFullUpdateCronTime, async () => {
    try {
      console.info('\n\n----------- CRONJOB INFORMATION -----------')
      console.info('Running (Sheets-To-Mongo and CRM Profile Refresher Cronjob)\nAt :: [%s]', Date())
      SheetsToMongo.execute()
    } catch (reason) {
      console.error('ERROR AT CRONJOB :: ', reason)
    }
  })
}
// -- Update last interaction cronjob
module.exports.UpdateLastInteractionCron = () => {
  let cronScheduleTime = '5 * * * *'
  const taskName = 'Update User\'s Last Interaction Cronjob'
  if (process.env.DEBUG_MODE === '1' || process.env.DEBUG_MODE === 'true') {
    cronScheduleTime = '*/2 * * * *'
  }
  scheduler.scheduleJob(taskName, cronScheduleTime, async () => {
    console.info('\n\n----------- CRONJOB INFORMATION -----------')
    console.info('Running (%s)\nAt :: [%s]', taskName, Date())
    // -- Call users interaction
    await UserActions.updateLastInteraction()
        .catch(err => console.log('Update of Users Last Interactions >> FAILED :: ', err))
  })
}

module.exports.SurveyToGoogleSheetsCron = () => {
  const taskName = 'Survey GoogleSheet Refresh'
  scheduler.scheduleJob(taskName, '0 4,13,23 * * *', async () => {
    try {
      console.info('\n\n----------- CRONJOB INFORMATION -----------')
      console.info('Running (%s)\nAt :: [%s]', taskName, Date())
      // -- Update Survey
      await CRM.surveyUpdate()
    } catch (reason) {
      console.error('Error in cronjob task...', reason)
    }
  })
}

module.exports.newQuiz = async () => {
  let timeOfQuiz
  if (process.env.NODE_ENV === 'develop' || process.env.NODE_ENV === 'quality') {
    timeOfQuiz = '00 14 * * 3'
  } else {
    timeOfQuiz = '53 13 * * 3'
  }
  scheduler.scheduleJob(timeOfQuiz, async () => {
    await broadcastSender.sendBroadcastMessage('mondayBroadcastQuiz', 'UNSUBSCRIBED')
    broadcastQuizTools.setContextInBot(true)
      .catch(() => console.log('An error occurred setting the users awaiting_answer parameter to 1 for the quiz answer'))
  })
}

module.exports.theWinnerIs = async () => {
  let timeOfWinner
  if (process.env.NODE_ENV === 'develop' || process.env.NODE_ENV === 'quality') {
    timeOfWinner = '55 13 * * 3'
  } else {
    timeOfWinner = '30 14 * * 3'
  }
  scheduler.scheduleJob(timeOfWinner, async () => {
    // -- Send the broadcast dialog with the messages of the Quiz
    await broadcastSender.sendBroadcastMessage('theWinnerIs', 'UNSUBSCRIBED')
    broadcastQuizTools.setContextInBot(false)
      .catch(() => console.log('An error occurred setting the users awaiting_answer parameter to 1 for the quiz answer'))
  })
}

// Restore users to previous context
module.exports.oneTimeFix = async () => {
  scheduler.scheduleJob('35 14 * * 3', async () => {
    broadcastQuizTools.setContextInBot(false)
      .catch(() => console.log('An error occurred setting the users awaiting_answer parameter to 1 for the quiz answer'))
  })
}

// -- Update/Create Facebook Labels and assign the users
module.exports.LabelCreationCron = async () => {
  const taskName = 'Facebook Label Creation CronJob'
  // await apiCalls.messaging.createBroadcastLabel()
  await apiCalls.messaging.userStatusLabels()
  await apiCalls.messaging.userLevelLabels()
  scheduler.scheduleJob(taskName, '0,30 * * * *', async () => {
    try {
      console.info('----------- CRONJOB INFORMATION -----------')
      console.info('Running (%s)\nAt :: [%s]', taskName, Date())
      // await apiCalls.messaging.createBroadcastLabel()
      await apiCalls.messaging.userStatusLabels()
      await apiCalls.messaging.userLevelLabels()
    } catch (reason) {
      console.error('ERROR in Label Creation at index.js :: ', reason)
    }
  })
}

// -- Send a report of the Monthly/Daily active users and new registrations
module.exports.DailyReportCron = () => {
  const taskName = 'Daily Report to Slack Cronjob'
  if (process.env.NODE_ENV === 'production') {
    scheduler.scheduleJob(taskName, '0 6 * * *', async () => {
      try {
        console.info('----------- CRONJOB INFORMATION -----------')
        console.info('Running (%s)\nAt :: [%s]', taskName, Date())
        // -- Call users interaction
        await apiCalls.messaging.dailyReportToSlack()

      } catch (reason) {
        console.error('ERROR :: This cronjob failed... Or was the programmer who made it?!')
        console.error('Details :: ', reason)
      }
    })
  }
}
