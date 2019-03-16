/**
 * GLOBAL dependencies
 */
const mongoose = require('mongoose');
const cronjobScheduler = require('node-schedule');
const Raven = require('raven');
const moment = require('moment');
const util = require('util');
const { slack } = require('../general/index');
Raven.config('https://96d6795013a54f8f852719919378cc59@sentry.io/304046').install();

// -- Promisify the string replace
util.promisify(String.prototype.split);
/**
 * LOCAL dependencies
 */
const { basicSender } = require('../dialogues/dialogues-builder');
const redis = require('../cache/index');

/**
 * Management
 */
const { UsersManagement } = require('../database/index');
const { ScheduleManagement } = require('../database/index');

/**
 * Collections
 */
const usersCollection = mongoose.connection.collection('user');
const scheduleCollection = mongoose.connection.collection('schedule');
const contentCollection = mongoose.connection.collection('content');

/**
 * Types of content
 */
const OnDemandLearningSystem = require('./on-demand-learning');
const RatingSystem = require('./rating-system');

/**
 * Remaining messages
 */
const inactivityMessage = {
  type: 'text',
  content: 'Hey, when you want to continue learning with me just write LEARN ;) 📚',
};

class Utility {
  /**
     * Validate user status to enable content sending
     * @param {User} user
     */
  static validateUser(user) {
    if (!user.subscription.status) {
      console.info(`WARNING :: User with ID ${user._id} has no subscription status - Check the database`);
      return false;
    }

    if (user.subscription.status === 'UNREGISTERED') {
      return false;
    }

    if (user.subscription.status === 'UNSUBSCRIBED') {
      return false;
    }

    if (user.subscription.status !== 'ACTIVE' && user.subscription.status !== 'INACTIVE') {
      console.info(`WARNING :: User has a status that is not within the authorized statuses and can't receive rating messages. Check the database for user with ID ${user._id}`);
      return false;
    }
    return true;
  }

  /**
	 * Validate user model for content purposes
	 * @param {User} user
	 */
  static async validateContentModel(user) {
    return new Promise(async (resolve, reject) => {
      if (!user.content) {
        // -- User does not have content model created so return an error message
        return resolve({
          success: false,
          message: `{content-model-validation} User [${user._id} - ${user.name.short_name}] does not have a content model related`,
        });
      }

      /**
			 * ***********************
			 * ** Fields validation **
			 * ***********************
			 */

      // [user.content.plan]
      if (!user.content.plan) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.plan': {
              language: 'english',
              level: 'beginner',
              accent: 'us',
            },
          },
        }, { new: true });
      }

      // [user.content.plan.language]
      if (!user.content.plan.level) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.plan.language': 'english',
          },
        }, { new: true });
      }

      // [user.content.plan.level]
      if (!user.content.plan.level) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.plan.level': 'beginner',
          },
        }, { new: true });
      }

      // [user.content.plan.accent]
      if (!user.content.plan.accent) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.plan.accent': 'us',
          },
        }, { new: true });
      }

      // [user.content.current]
      if (!user.content.current) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.current': {
              lesson: 0,
              message: 0,
              until_lesson: 0,
            },
          },
        }, { new: true });
      }

      // [user.content.current.lesson]
      if (!user.content.current.lesson) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.current.lesson': 0,
          },
        }, { new: true });
      }

      // [user.content.current.message]
      if (!user.content.current.message) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.current.message': 0,
          },
        }, { new: true });
      }

      // [user.content.current.until_lesson]
      if (!user.content.current.until_lesson) {
        await usersCollection.findOneAndUpdate({ _id: user._id }, {
          $set: {
            'content.current.until_lesson': 0,
          },
        }, { new: true });
      }

      return resolve({
        success: true,
        message: `{content-model-validation} User [${user._id} - ${user.name.short_name}] success`,
      });
    });
  }
}

/**
 * Description :: This class schedule all the users one by one in a single iteration
 */
class ContentSystem {
  // -- Main scheduler
  static async schedule(userId = false, newUser = false) {
    // -- Schedule content system
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
      console.info('------------ SCHEDULE CONTENT SYSTEM ------------');
    }

    return new Promise(async (resolve, reject) => {
      try {
        // -- Query each user or just the user specified
        const userCursor = userId ? usersCollection.find({ _id: userId }) : usersCollection.find();
        let user;

        while ((user = await userCursor.next())) {
          // -- Validate user
          if (!Utility.validateUser(user)) {
            continue;
          }
          Utility.validateContentModel(user);

          // -- Prepare schedules
          await OnDemandLearningSystem.prepareSchedule(user, newUser);
        }
        return resolve({ success: true, message: 'Content Schedules have been properly set up' });
      } catch (reason) {
        slack.notifyError(reason, 'ContentSystem.schedule');
        console.error('An error occurred on (schedule-content) ', reason);
        return reject({ success: false, error: reason });
      }
    });
  }

  /* ***********************************************************************************************************
  * * ********************************* Main scheduler program **************************************************
  * * ********************************************************************************************************** */
  static async program(options = { restart: false }) {
    // -- Activate each inner cronjob
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
      console.info('------------ PROGRAM CONTENT SYSTEM ------------');
    }

    return new Promise(async (resolve, reject) => {
      try {
        // -- Query each message to be scheduled
        const scheduleCursor = (options.restart)
          ? scheduleCollection.find()
          : scheduleCollection.find({ cronjob_status: false });
        let schedule = await scheduleCursor.next();

        do {
          // -- Program cronjob
          if (!schedule) {
            continue;
          }
          const user = await usersCollection.findOne({ _id: schedule.send_to })
            .catch((err) => {
              slack.notifyError('ERROR in index.js\nFUNCTION :: program()\nSTARTING LINE :: 204',
                `The function tried to find a user with _id = schedule.send_to and this happened:\n${err}`);
            });
          if (!user) {
            continue;
          }
          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
            console.info('Next content [%s] will be available on [%s] for the user [%s - %s]', schedule.type, schedule.date.toString(), user.name.short_name, schedule.send_to);
          }
          const thisScheduleName = schedule._id;
          cronjobScheduler.scheduleJob(thisScheduleName, schedule.date, async () => {
            if (this) {
              const schedule = await scheduleCollection.findOne({ _id: thisScheduleName });
              if (!schedule) {
                console.error('{schedule} does not exist');
              } else if (schedule.type === 'on-demand') {
                await ContentSystem.enableLessons(schedule.send_to);
                await scheduleCollection.deleteOne({ _id: schedule._id });
              }
              this.cancel();
            } else {
              const today = new Date();
              slack.notifyError(`Cronjob at ${today} failed to execute due to pointer "this" being undefined.\nLessons were not enabled and rating messages were not send.`,
                `ContentSystem.program in content.js\nCronjob: ${this}\nLine: 231`);
            }
          });
          // -- Update cronjob_status to true
          await ScheduleManagement.update(schedule._id, { cronjob_status: true });
          schedule = await scheduleCursor.next();
        } while (schedule);
        return resolve({ success: true, message: 'Program successfully created' });
      } catch (reason) {
        console.error('An error occurred on (program-content) ', reason);
        slack.notifyError(reason, 'ContentSystem.program');
        return reject({ success: false, error: reason });
      }
    });
  }

  static async senderWeek(userId) {
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
      console.info('------------ CONTENT SYSTEM SENDER ------------');
    }
    return new Promise(async (resolve, reject) => {
      try {
        // -- Avoid lock stage && delete existing cronjobs
        await redis.hashSetUser(userId, 'prev_flow', 'OpenTalk');
        await redis.hashSetUser(userId, 'current_flow', 'OpenTalk');
        await redis.hashSetUser(userId, 'awaiting_answer', '0');
        await redis.hashSetUser(userId, 'next_pos', 'FinalContentMsg');
        await redis.hashSetUser(userId, 'open_question', true);
        const cron = cronjobScheduler.scheduledJobs[`user-inactivity-${userId}`];
        if (cron) {
          cron.cancel();
        }

        // -- Retrieve content
        const user = await usersCollection.findOne({ _id: userId });
        const language = `${user.content.plan.language}-${user.content.plan.level}-${user.content.plan.accent}`;
        let { current } = user.content;
        const initialLesson = current.lesson;
        const initialMessage = current.message;
        const contentCursor = contentCollection.aggregate([
          { $match: { language, type: 'week', lesson: { $gte: current.lesson, $lte: current.until_lesson } } },
          { $sort: { message_id: 1 } },
          {
            $group: {
              _id: '$lesson',
              messages: { $push: { body: '$message', index: '$message_id', pause: '$pause' } },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, lesson: '$_id', messages: 1 } },
        ]);
        let content = await contentCursor.next();
        let nextCanBePause = false;
        let quickReplies = false;
        let lastMessageIndex = current.message;

        // -- Prepare messageBuilder instance
        const messageBuilder = new basicSender(user.senderId);

        // -- Message sender
        // -- IF User finished 10 lessons
        if (content.lesson === current.until_lesson && lastMessageIndex === content.messages[content.messages.length - 1].index) {
          // -- Reset to OpenTalk Context
          await redis.hashSetUser(userId, 'prev_flow', 'OpenTalk');
          await redis.hashSetUser(userId, 'current_flow', 'OpenTalk');
          await redis.hashSetUser(userId, 'awaiting_answer', '0');
          await redis.hashSetUser(userId, 'next_pos', 'FinalContentMsg');
          await redis.hashSetUser(userId, 'open_question', true);

          // -- Return the 222 code to tell the BOT that the lessons are FINISHED for today
          return resolve({
            success: true,
            message: 'Content lessons are ended for the day for this user',
            statusCode: 222,
          });
        }

        do {
          // -- For each message SYNC
          lastMessageIndex = 0;

          for (const message of content.messages) {
					  lastMessageIndex = message.index;

            // -- IF User is Starting
            if ((content.lesson === initialLesson && message.index > initialMessage) || (content.lesson > initialLesson)) {
              // -- IF we want the user to reply to us now
              if (nextCanBePause && !message.pause) {
							  break;
              }

              // -- Send message
              const messageArray = [message.body];
              for (let message of messageArray) {
                if (typeof message.content === 'string') {
                  message = Object.assign({}, message, { content: message.content.replace(/{{name}}/gi, user.name.short_name) });
                }

                if (message.type === 'quickReplies') {
                  message = Object.assign({}, message, {
                    content: {
                      title: message.content.title.replace(/{{name}}/gi, user.name.short_name),
                      buttons: message.content.buttons,
                    },
                  });
                }

                await messageBuilder.sendMessages([message]);
              }

              // -- User pass to next message
              await usersCollection.findOneAndUpdate({ _id: user._id }, {
                $set: {
                  'content.current.lesson': content.lesson,
                },
              }, { new: true })
                .catch(err => console.error('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n ERROR PASSING USER TO NEXT LESSON\n%s', err));

              await usersCollection.findOneAndUpdate({ _id: user._id }, {
                $set: {
                  'content.current.message': message.index,
                },
              }, { new: true })
                .catch(err => console.error('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n ERROR PASSING USER TO NEXT MESSAGE\n%s', err));

              current = { lesson: content.lesson, message: message.index, until_lesson: current.until_lesson };

              if (process.env.NODE_ENV === 'develop') {
                console.log('Current :: ', current);
              }
              // -- Conditions for sending the next message
              if (message.body.type === 'quickReplies') {
							  quickReplies = true;
                break;
              }
              if (message.pause && !nextCanBePause) {
                nextCanBePause = true;
              }
            }
          }

          // -- Break clauses
          if (nextCanBePause && !content.pause) {
            break;
          }
          if (quickReplies) {
            break;
          }
          content = await contentCursor.next();
        } while (content);

        if (nextCanBePause) {
          // -- Stop the dialogues with awaiting answer
          await redis.hashSetUser(user._id, 'prev_flow', 'content');
          await redis.hashSetUser(user._id, 'current_flow', 'content');
          await redis.hashSetUser(user._id, 'awaiting_answer', '1');
          await redis.hashSetUser(user._id, 'next_pos', 'sendContent');
          await redis.hashSetUser(user._id, 'open_question', true);

          // -- SET 3H CRONJOB
          await ContentSystem.programWeek(user)
            .catch(err => console.error('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n ERROR PROGRAMMING USER WEEK\n%s', err));
        }

        return resolve({ success: true, message: 'Content messages sent successfully', statusCode: 201 });
      } catch (reason) {
        console.error('\nError at [-> cron/index.js <-] in Function [-> senderWeek() <-]\n', reason);
        slack.notifyError(reason, 'ContentSystem.senderWeek()');
        return reject({ success: false, error: reason });
      }
    });
  }

  static async enableLessons(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('PROMOTE USER LESSONS');
        }
        let user = await usersCollection.findOne({ _id: userId });
        const sum = (user.content.current.until_lesson - user.content.current.lesson) > 10 ? 0 : 10 - (user.content.current.until_lesson - user.content.current.lesson);
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('SUM IS :: ', sum);
        }
        await usersCollection.update({ _id: userId }, { $inc: { 'content.current.until_lesson': sum } });
        user = await usersCollection.findOne({ _id: userId });
        await usersCollection.deleteOne({ _id: userId });
        await UsersManagement.create(user);
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('LESSONS FINISHED');
        }
        return resolve({ success: true, message: 'Lessons enabled successfully' });
      } catch (reason) {
        slack.notifyError(error, 'ContentSystem.enableLessons');
        console.log('An error occurred :: ', reason);
        return reject({ success: false, message: 'There was an error while enabling the lessons' });
      }
    });
  }

  static activateReminder(user) {
    return async () => {
      try {
        const basicSender = new basicSender(user.senderId);

        // -- Reset bot variables
        await redis.hashSetUser(user._id, 'prev_flow', 'OpenTalk');
        await redis.hashSetUser(user._id, 'current_flow', 'OpenTalk');
        await redis.hashSetUser(user._id, 'awaiting_answer', '0');
        await redis.hashSetUser(user._id, 'next_pos', 'FinalContentMsg');
        await redis.hashSetUser(user._id, 'open_question', true);

        // -- Send inactivity message
        const messageArray = [inactivityMessage];
        for (let message of messageArray) {
          if (typeof message.content === 'string') {
            message = Object.assign({}, message, { content: message.content.replace(/{{name}}/g, user.name.short_name) });
          }

          if (message.type === 'quickReplies') {
            message = Object.assign({}, message, { content: { title: message.content.title.replace(/{{name}}/g, user.name.short_name) } });
          }
          await basicSender.sendMessages([message]);
        }
      } catch (error) {
        slack.notifyError(error, 'ContentSystem.activateReminder');
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.info('{reminder} An error occurred');
          console.error(error);
        }
      }
    };
  }

  static async programWeek(userFullProfile) {
    return new Promise(async (resolve, reject) => {
      try {
        let date;
        if (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1') {
          date = moment().add(2, 'minutes').toDate();
        } else {
          date = moment().add(3, 'hours').toDate();
        }

        cronjobScheduler.scheduleJob(`user-inactivity-${userFullProfile._id}`, date, ContentSystem.activateReminder(userFullProfile));
        return resolve({ success: true, message: 'Success cronjob' });
      } catch (error) {
        slack.notifyError(error, 'ContentSystem.programWeek');
        return reject({ success: false, message: 'An error occurred', error });
      }
    });
  }

  /**
	 * Sender function
	 */
  static async sender(scheduleId) {
    console.info('------------ CONTENT SYSTEM SENDER ------------');
    return new Promise(async (resolve, reject) => {
      try {
        const scheduleCursor = scheduleCollection.aggregate([
          {
            $match: { _id: scheduleId },
          },
          {
            $lookup: {
              from: 'user',
              localField: 'send_to',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $project: {
              _id: 1,
              userName: '$user.name.full_name',
              userId: '$user._id',
              senderId: '$user.senderId',
              conversationId: '$user.conversationId',
              messages: '$messages',
              date: '$date',
              type: '$type',
            },
          },
        ]);

        const schedule = await scheduleCursor.next();
        if (schedule) {
          // -- Get previous messages
          const previousWeeksValues = [];

          let { messages } = schedule;
          const messagesToBeSent = [];

          // -- Button logic
          for (const message of messages) {
            messagesToBeSent.push(message);
            if (message.type === 'quickReplies') {
              break;
            }
          }
          messages = messagesToBeSent;

          // if (messages.length === 0) continue;

          try {
            // -- Send messages
            if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
              console.log('Sending content [%s] messages to user [%s - %s]', schedule.type, schedule.userId, schedule.userName);
            }
            const basicSender = new basicSender(schedule.senderId);
            await basicSender.sendMessages(messages.map(message => ({ type: message.type, content: message.content })));
          } catch (reason) {
            console.error('\nError at [-> cron/index.js <-] in Function [-> sender <-]\n');
            Raven.captureException(reason);
          }

          // -- Pull sent messages from ON DEMAND
          // -- Get the remaining messages
          const remainingMessages = schedule.messages.slice(messages.length, schedule.messages.length);
          await ScheduleManagement.update(schedule._id, { messages: remainingMessages });
        }

        return resolve({ success: true, message: 'Content messages sent successfully' });
      } catch (reason) {
        console.error('\nError at [-> cron/index.js <-] in Function [-> sender <-]\n', reason);
        slack.notifyError(`ERROR in sender function:${reason}`, 'sender() of index.js\nLine: 471');
        return reject({ success: false, error: reason });
      }
    });
  }

  static async ratingSystemReminder(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const basicSender = new basicSender(user.senderId);
        await basicSender.sendMessages(RatingSystem.RatingMessagesReminder);
        return resolve({ success: true, message: 'Reminder was properly sent' });
      } catch (reason) {
        return reject({ success: false, error: reason });
      }
    });
  }
}

module.exports = ContentSystem;
