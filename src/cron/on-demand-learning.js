/**
 * GLOBAL dependencies
 */
const slack = require('../general/index').slack
const mongoose = require('mongoose')
const uuid = require('uuid/v1')
const Raven = require('raven')
const moment = require('moment')
Raven.config('https://96d6795013a54f8f852719919378cc59@sentry.io/304046').install()

/**
 * Management
 */
const ScheduleManagement = require('../database/index').ScheduleManagement
const UsersManagement = require('../database/index').UsersManagement

/**
 * Collections
 */
const scheduleCollection = mongoose.connection.collection('schedule')
const usersCollection = mongoose.connection.collection('user')

class OnDemandLearning {

	// -- Schedule crontask for a user re adquire next lessons
  static async prepareSchedule (user, newUser = false) {
    let timezone
    try {
      timezone = user.location.timezone
    } catch (error) {
      slack.notifyError(error, 'OnDemandLearning.prepareSchedule')
      const reason = { success: false, message: 'An error occurred trying to retrieve user model variables', error }
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.info(reason.message)
        console.error(reason.error)
      }
      return reason
    }
    return new Promise(async (resolve, reject) => {
      // -- Prepare schedule
      let schedule = { _id: uuid(), send_to: user._id, type: 'on-demand', cronjob_status: false, lesson: user.content.current.lesson }

      // -- Set Schedule date
      if (newUser || user.content.current.until_lesson === 0) {
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Increment on 10 for user [%s]', user.name.short_name) }

        await usersCollection.update({ _id: user._id }, { $inc: { 'content.current.until_lesson': 10 } })
        let _user = await usersCollection.findOne({ _id: user._id })
        await usersCollection.deleteOne({ _id: user._id })
        await UsersManagement.create(_user)
        _user = await usersCollection.findOne({ _id: user._id })
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('The user content current is :: ', _user.content.current) }
      }

			// -- Date (Next day on user time)
      schedule.date = process.env.ON_DEMAND_CONTENT_HOUR
				.hourFormatToDate()
				.toUserTimezone(timezone)
      schedule.date = moment(schedule.date).add(1, 'days').toDate()

      if (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1') {
        console.log('Date develop mode :: ')
        schedule.date = moment().add(2, 'minutes').toDate()
      }

			// -- Save schedule
      const userSchedule = await scheduleCollection.findOne({ send_to: user._id, type: 'on-demand', lesson: user.content.current.lesson })
      if (!userSchedule) {
        // -- Create schedule and send initial content ASAP
        // -- Creating initial
        schedule = await ScheduleManagement.create(schedule)
      } else {
        // -- If date is in the past, the update
      }

      // if (schedule) { console.info('10 more lessons will be available on [%s] for user [%s - %s]', schedule.date.toString(), user.name.short_name, user._id) }

      return resolve({
        success: true,
        message: `{on-demand} User [${user._id} - ${user.name.short_name}] schedule created|updated`,
      })
    })
  }
}

/**
 * Sending content cron tasks
 */
module.exports = OnDemandLearning
