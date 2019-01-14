const remindersManagement = require('../database/index').RemindersManagement;
const usersManagement = require('../database/index').UsersManagement;
const moment = require('moment');
const basicSender = require('../dialogues/dialogues-builder').basicSender;
const redis = require('../cache/index');
const nodeScheduler = require('node-schedule');
const mongoose = require('mongoose');
const remindersCollection = mongoose.connection.collection('reminders');
const dialogues = require('../dialogues/dialogues-content').dialoguesContent;
const asyncForEach = require('eachasync');

class remindersFunctions {
  static async createReminderInDB(userId, senderId, messageName, timezone) {
    let whenToSend;
    let nextToSend;
    if (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1') {
      whenToSend = moment(new Date()).add(1, 'minutes');
      nextToSend = whenToSend;
    } else {
      whenToSend = new Date();
      whenToSend.setHours(12, 0, 0, 0);
      whenToSend = whenToSend.toLocaleTimezone(timezone);
      nextToSend = moment(whenToSend).add(1, 'd').toDate();
    }

    // -- Define the reminder to send, in this case, the dialog of the Daily Reminder
    const dailyReminder = {
      userId, senderId, start_date: whenToSend, message: messageName, flow_update: '{}', repeat: true, next_date: nextToSend,
    };

    // -- Find if there is a reminder with the same name and user already created
    const existingReminder = await remindersCollection.findOne({ userId, message: messageName })
      .catch(e => console.error('Error looking out for previous reminders ::', e));

    /* -- Does this reminder already exist?
     If it does exist, erase those that have the same userId, message and date */
    if (existingReminder) {
      await remindersCollection.deleteMany({ userId, message: messageName })
        .catch(e => console.error('Error, we were not able to delete the previous reminders ::', e));
    }
    await remindersManagement.create(dailyReminder, { updateIfExist: true })
      .catch(e => console.error('Error creating the daily reminder :: ', e));
  }

  static async sendReminder(senderId, conversationId, message) {
    const basicSender = new basicSender(senderId);
    await basicSender.sendMessages(message)
      .catch(e => console.error('Error sending reminder :: ', e));
  }

  static async programReminderCron(userProfileId) {
    // -- Retrieve the reminders as well as the user's name, senderId and conversationId
    const reminderCursor = await remindersCollection.aggregate([
      {
        $match: { userId: userProfileId },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'userId',
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
          name: '$user.name',
          location: '$user.location',
          senderId: '$user.senderId',
          conversationId: '$user.conversationId',
          start_date: 1,
          message: 1,
          flow_update: 1,
          repeat: 1,
          next_date: 1,
        },
      },
    ]);
    // -- User .next() to move the cursor to the actual data
    const reminderData = await reminderCursor.next();

    // -- retrieve the dialog to send which is an array of arrays of objects: [ [{message1}], [{message2}], ..., [{messageN}]]
    const dialogToSend = dialogues(reminderData.message, reminderData.name.first_name);

    // -- Define the variables we will need for cronjobs creation and destruction
    let cronId;
    let cronExistence;
    let nextDate = new Date(reminderData.next_date);

    // -- Loop through each object in the dialog to send
    await asyncForEach(dialogToSend, async (msg, index) => {
      //
      if (process.env.DEBUG_MODE === 'true' || process.env.DEBUG_MODE === '1') {
        nextDate = moment(nextDate).add(10, 'seconds').toDate();
      } else {
        nextDate = moment(nextDate).add(1, 'd').toDate();
      }

      // -- Define the Id of the cronjob and check that it is not already created
      cronId = `${reminderData.senderId}${reminderData.message}-${index}`;
      cronExistence = nodeScheduler.scheduledJobs[cronId];
      if (cronExistence) {
        cronExistence.cancel();
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Cronjob for reminder %s canceled.', cronId); }
      }

      if (!reminderData.conversationId || !reminderData.senderId) {
        console.log('<!> Warning: could not create cronjob reminders for User [%s]\nConversationId: [%s]\nSenderId: [%s]', reminderData.name.first_name, reminderData.conversationId, reminderData.senderId);
      } else {
      // -- Finally create the CRONJOB that will send the message on the nextDate
        nodeScheduler.scheduleJob(cronId, nextDate, async () => {
          await remindersFunctions.updateFlow(reminderData._id, reminderData.flow_update)
            .catch(err => console.error('ERROR UPDATING THE FLOW ACCORDING TO THE REMINDER MATE :: ', err));
          await remindersFunctions.sendReminder(reminderData.senderId, reminderData.conversationId, msg)
            .catch(err => console.error('ERROR SENDING THE REMINDER MATE :: ', err));
        });
      }
    });
  }

  static async updateFlow(userHash, flowString) {
    const flowObject = JSON.parse(flowString);
    await Object.keys(flowObject).forEachAsync(async (name) => {
      const value = flowObject[name];
      await redis.hashSetUser(userHash, name, value)
        .catch(e => console.error('Error updating user dialogues :: ', e));
    });
  }

  // -- Program reminders for everyone in the database
  static async buildRemindersFullDB() {
    const users = await usersManagement.retrieve();
    let totalProgrammed = 0;
    await asyncForEach(users, async (user) => {
      if (user) {
        await remindersFunctions.createReminderInDB(user._id, user.senderId, 'dailyReminder', user.location.timezone)
          .catch(err => console.error(err));
        if (!user.conversationId || !user.senderId) {
          console.log('<!> Warning: could not create cronjob reminders for User [%s]\nConversationId: [%s]\nSenderId: [%s]', user.name.first_name, user.conversationId, user.senderId);
        } else if (user.subscription.status === 'UNSUBSCRIBED') {
          console.log('User %s is unsubscribed, omitting reminder creation', user.name.full_name);
        } else {
          await remindersFunctions.programReminderCron(user._id)
            .catch(err => console.error(err))
            .then(totalProgrammed += 1);
        }
      }
    });
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.info('Reminders successfully programmed :: ', totalProgrammed); }
  }
}
module.exports = { remindersFunctions };
