/**
 * Dependencies
 */
const Reminder = require('./reminder.model')

class RemindersManagement {

    /**
     * Create reminder model
     * @param {*} reminderModel
     * @param {*} params
     */
  async create (reminderModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist) {
                    // -- Save reminder
          resolve(await (new Reminder(reminderModel)).save())
        } else {
                    // -- FindOne and Update
          const reminderId = reminderModel._id
          delete reminderModel._id
          const reminder = await Reminder.findOneAndUpdate({ _id: reminderId }, { $set: reminderModel }, { new: true })
          resolve(reminder === null || reminder === undefined ? await (new Reminder(reminderModel)).save() : reminder)
        }
      } catch (reason) {
        console.log('[ReminderManagement (Update)] An error ocurred while creating reminder [%s]', reason.message)
        reject(reason)
      }
    })
  }

    /**
     * Retrieve Reminder
     */
  async retrieve (options = { query: {}, findOne: false }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        Reminder.find(options.query, (error, reminderFound) => {
          if (error) {
            reject(error)
          } else { resolve(reminderFound) }
        }).lean()
      } else {
        Reminder.findOne(options.query, (error, remindersFound) => {
          if (error) {
            reject(error)
          } else { resolve(remindersFound) }
        }).lean()
      }
    })
  }

    /**
     * Update Reminder
     */
  async update (_id, set) {
    try {
      return await Reminder.findOneAndUpdate({ _id }, { $set: set }, { new: true })
    } catch (reason) {
      console.error('[ReminderManagement (Update)] An error ocurred while updating reminders [%s]', reason.message)
    }
  }

  async findAndUpdate (query, set) {
    try {
      return await Reminder.findOneAndUpdate(query, { $set: set }, { new: true })
    } catch (reason) {
      console.error('[ReminderManagement (Update)] An error ocurred while updating reminders [%s]', reason.message)
    }
  }

    /**
     * Delete Reminders
     * @param _id => Reminder Identifier
     */
  async delete (_id) {
    return new Promise((resolve, reject) => {
      Reminder.findOneAndRemove({ _id }, (error, reminderDeleted) => {
        if (error) { reject(error) } else { resolve(reminderDeleted) }
      })
    })
  }
}

module.exports = new RemindersManagement()
