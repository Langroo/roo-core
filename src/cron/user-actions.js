/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const redis = require('../cache/index')
const cronjobScheduler = require('node-schedule')
const facebookAPI = require('../APIs/facebook').apiCalls

const UsersManagement = require('../database/index').UsersManagement
const scheduleCollection = mongoose.connection.collection('schedule')
const usersCollection = mongoose.connection.collection('user')

Date.daysBetween = function (date1, date2) {   // Get 1 day in milliseconds
  const one_day = 1000 * 60 * 60 * 24    // Convert both dates to milliseconds
  const date1_ms = date1.getTime()
  const date2_ms = date2.getTime()    // Calculate the difference in milliseconds
  const difference_ms = date2_ms - date1_ms        // Convert back to days and return
  return Math.round(difference_ms / one_day)
}

class UserActions {

    // -- Cron Task
  static async updateLastInteraction () {

    // -- Update last interaction for each user
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('-------------- UPDATE LAST INTERACTION --------------') }
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Updating user last interaction...') }

    // -- Variables declaration
    let userCache
    let lastInteraction
    let lastDateUserMessaged
    let actual

        // -- Foreach cursor
    const usersCursor = usersCollection.find()
    let user = await usersCursor.next()
    do {
      // -- Find user in redis and mongo
      userCache = await redis.hashGetUser(user._id)

      // -- If user has no userCache, notify the database inconsistency and continue iterating
      if (!userCache) {
        user = await usersCursor.next()
        continue
      }
      lastInteraction = new Date(userCache.last_interaction)
      lastDateUserMessaged = user.lastInteraction
      actual = new Date()

      // -- If the user lacks a cache or is Unsubscribed or Unregistered, do not change status
      if (!userCache || user.subscription.status === 'UNSUBSCRIBED' || user.subscription.status === 'UNREGISTERED') {
        // -- Drop all related cronjobs if exist
        await scheduleCollection.deleteMany({ send_to: user._id })
        let cron = null

        // -- User inactivity
        cron = cronjobScheduler.scheduledJobs[`user-inactivity-${user._id}`]
        if (cron) { cron.cancel() }

        // -- Rating respond user
        cron = cronjobScheduler.scheduledJobs[`user-rating-${user._id}`]
        if (cron) { cron.cancel() }

        continue
      }

      // -- Update user status
      try {
        if (Date.daysBetween(lastDateUserMessaged, actual) > 7 && Date.daysBetween(lastInteraction, actual) <= 7) {
          await UsersManagement.findAndUpdate({ _id: user._id }, { 'subscription.status': 'ACTIVE' })
          await facebookAPI.messaging.assignUserToLabel(user.senderId, 'ACTIVE')
        } else if (Date.daysBetween(lastDateUserMessaged, actual) > 7 && Date.daysBetween(lastInteraction, actual) > 7) {
          await UsersManagement.findAndUpdate({ _id: user._id }, { 'subscription.status': 'INACTIVE' })
          await facebookAPI.messaging.assignUserToLabel(user.senderId, 'INACTIVE')
        }

      } catch (error) {
        console.error('{UserActions} - {updateLastInteraction()} Error :: ', error.message)
        continue
      }
      user = await usersCursor.next()
    } while (user)
  }

  static async dropScheduleAndReset () {
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('--------- RESETING CONTENT -----------') }

    const usersCursor = await usersCollection.find()
    let user
    while ((user = await usersCursor.next())) {

      // -- Delete schedule
      await UsersManagement.findAndUpdate({ _id: user._id }, {
        'content.current': {
          lesson: 0,
          message: 0,
          until_lesson: 0,
        },
      })
      await scheduleCollection.deleteMany({ send_to: user._id })
    }

  }

  static async deleteSchedules () {
    try {

      const response = await scheduleCollection.deleteMany({})
      // let response = await ScheduleManagement.deleteAll();
      return {
        success: false,
        response,
      }

    } catch (error) {

      return {
        success: false,
        error,
      }

    }
  }
}

/**
 * All cron tasks
 */
module.exports = UserActions
