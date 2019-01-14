/**
 * GLOBAL dependencies
 */
const mongoose = require('mongoose');
const uuid = require('uuid/v1');
const Raven = require('raven');
const moment = require('moment');
const cronjobScheduler = require('node-schedule');
Raven.config('https://96d6795013a54f8f852719919378cc59@sentry.io/304046').install();

/**
 * Management
 */
const ScheduleManagement = require('../database/index').ScheduleManagement;

/**
 * Collections
 */
const scheduleCollection = mongoose.connection.collection('schedule');

/**
 * Static messages
 */
const ratingMessages = [
  {
    type: 'text',
    content: 'Hey, after your first week, I want to ask you... how likely would you be to recommend Langroo to your friend from a scale of 1-10? 😜',
  },
  {
    type: 'quickReplies',
    content: {
      title: 'Select a number below 😁👇',
      buttons: [
        { title: '1', value: 'rating_response_1' },
        { title: '2', value: 'rating_response_2' },
        { title: '3', value: 'rating_response_3' },
        { title: '4', value: 'rating_response_4' },
        { title: '5', value: 'rating_response_5' },
        { title: '6', value: 'rating_response_6' },
        { title: '7', value: 'rating_response_7' },
        { title: '8', value: 'rating_response_8' },
        { title: '9', value: 'rating_response_9' },
        { title: '10', value: 'rating_response_10' },
      ],
    },
  },
];

const ratingMessagesReminder = [
  {
    type: 'text',
    content: 'Hey, you forgot to reply our recommendation, so... After your first week, I want to ask you... how likely would you be to recommend Langroo to your friend from a scale of 1-10? 😜',
  },
  {
    type: 'quickReplies',
    content: {
      title: 'Select a number below 😁👇',
      buttons: [
        { title: '1', value: 'rating_response_1' },
        { title: '2', value: 'rating_response_2' },
        { title: '3', value: 'rating_response_3' },
        { title: '4', value: 'rating_response_4' },
        { title: '5', value: 'rating_response_5' },
        { title: '6', value: 'rating_response_6' },
        { title: '7', value: 'rating_response_7' },
        { title: '8', value: 'rating_response_8' },
        { title: '9', value: 'rating_response_9' },
        { title: '10', value: 'rating_response_10' },
      ],
    },
  },
];

class RatingSystem {
  static async prepareSchedule(user) {
    if (!user.content) {
      return {
        success: false,
        message: `{rating-system} User [${user._id} - ${user.name.short_name}] schedule error`,
      };
    }

    const timezone = user.location.timezone;

    return new Promise(async (resolve, reject) => {
      // -- Prepare rating system content - sunday
      const schedule = {
        _id: uuid(),
        send_to: user._id,
        type: 'rating-system',
        cronjob_status: false,
        messages: [],
      };

      // -- Prepare messages
      for (let message of ratingMessages) {
        // -- Personalize messages
        if (message.type === 'text') {
          message = Object.assign({}, message, { content: message.content.replace('{{name}}', user.name.short_name) });
        }
        schedule.messages.push(message);
      }

      // -- Set Schedule date
      if (process.env.NODE_ENV === 'develop' && (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1')) {
        // -- Date (progress - debug)
        console.log('Scheduling rating system');
        schedule.date = moment().add(1, 'minutes').toDate();
      } else if (process.env.NODE_ENV === 'quality' && (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1')) {
        // -- Date (progress - debug)
        console.log('Scheduling rating system {QA}');
        schedule.date = moment().add(15, 'minutes').toDate();
      } else {
        // -- Date (Next sunday on user time)
        schedule.date = process.env.RATING_SYSTEM_CONTENT_HOUR
          .hourFormatToDate()
          .nextOf(process.env.RATING_SYSTEM_START_DAY)
          .toLocaleTimezone(timezone);
      }

      if (schedule && (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1')) { console.info('Content [rating-system] will start to be sent at [%s] for user [%s - %s]', schedule.date, user.name.short_name, user._id); }

      // -- Check if user has schedule rating system creted or not
      const userSchedule = await scheduleCollection.findOne({ send_to: user._id, type: 'rating-system' });
      if (!userSchedule) {
        // -- Create schedule rating system
        await ScheduleManagement.create(schedule)
          .catch(err => console.error('Error creating rating-system schedule con line 131 :: ', err));
      } else if (new Date() > userSchedule.date) {
        // -- Update schedule rating system
        await ScheduleManagement.update(userSchedule._id, {
          date: schedule.date,
          cronjob_status: false,
          messages: schedule.messages,
        });

        const cron = cronjobScheduler.scheduledJobs[`user-inactivity-${userSchedule.send_to}`];
        if (cron) { cron.cancel(); }
      }

      return resolve({
        success: true,
        message: `{rating-system} User [${user._id} - ${user.name.short_name}] schedule created|updated`,
      });
    });
  }
}

/**
 * Sending rating system crontask
 */
module.exports = RatingSystem;
module.exports.RatingMessages = ratingMessages;
module.exports.RatingMessagesReminder = ratingMessagesReminder;
