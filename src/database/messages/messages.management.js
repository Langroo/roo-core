const message = require('./messages.schema')

// -- Static class, must be called as InstanceName.messagesManagement.function()
class messagesManagement {

  // -- Create a message
  static async create (messagesModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist) {
          resolve(await (new message(messagesModel)).save())
        } else {
          const message = await message.findOneAndUpdate({ _id: messagesModel._id }, { $set: messagesModel }, { new: true })
          resolve(message === null || message === undefined ? await (new message(messagesModel)).save() : message)
        }
      } catch (reason) {
        console.log('An error occurred while creating the message')
        reject(reason)
      }
    })
  }

  // -- Retrieve one or more messages
  static async retrieve (options = { query: {}, findOne: false }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        // -- Returns an ARRAY
        message.find(options.query, (error, messagesFound) => {
          if (error) {
            reject(error)
          } else {
            resolve(messagesFound)
          }
        }).lean()
      } else {
        message.findOne(options.query, (error, messageFound) => {
          if (error) {
            reject(error)
          } else {
            resolve(messageFound)
          }
        }).lean()
      }
    })
  }

  // -- Update a message
  static async update (_id, set) {
    try {
      return await message.findOneAndUpdate({ _id }, { $set: set }, { new: true })
    } catch (reason) {
      console.log('An error occurred while updating message ', reason)
    }
  }

  static async findAndUpdate (query, set) {
    try {
      return await message.findOneAndUpdate(query, { $set: set }, { new: true })
    } catch (reason) {
      console.log('An error occurred while updating message ', reason)
    }
  }

  // -- Delete a message
  static async delete (id) {
    return new Promise((resolve, reject) => {
      message.findOneAndRemove({ id }, (error, messageDeleted) => {
        if (error) {
          reject(error)
        } else {
          resolve(messageDeleted)
        }
      })
    })
  }
}

module.exports = messagesManagement
