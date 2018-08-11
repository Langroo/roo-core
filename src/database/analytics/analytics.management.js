/**
 * Dependencies
 */
const Analytics = require('./analytics.model')

class AnalyticsManagement {

    /**
     * Create analytics model
     * @param {*} analyticsModel
     * @param {*} params
     */
  async create (analyticsModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist) {
                    // -- Save pronunciation
          resolve(await (new Analytics(analyticsModel)).save())
        } else {
                    // -- FindOne and Update
          const pronunciationId = analyticsModel._id
          delete analyticsModel._id
          const analytics = await Analytics.findOneAndUpdate({ _id: pronunciationId }, { $set: analyticsModel }, { new: true })
          resolve(!analytics ? await (new Analytics(analyticsModel)).save() : analytics)
        }
      } catch (reason) {
        console.log('[AnalyticsManagement (Update)] An error occurred while creating analytics [%s]', reason)
        reject(reason)
      }
    })
  }

    /**
     * Retrieve Analytics
     */
  async retrieve (options = {
    query: {},
    findOne: false,
  }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        Analytics.find(options.query, (error, analyticsFound) => {
          if (error) {
            reject(error)
          } else { resolve(analyticsFound) }
        }).lean()
      } else {
        Analytics.findOne(options.query, (error, analyticsFound) => {
          if (error) {
            reject(error)
          } else { resolve(analyticsFound) }
        }).lean()
      }
    })
  }

    /**
     * Update Analytics
     */
  async update (_id, set) {
    try {
      return await Analytics.findOneAndUpdate({ _id }, { $set: set }, { new: true })
    } catch (reason) {
      console.error('[Analytics (Update)] An error ocurred while updating analytics [%s]', reason.message)
    }
  }

  async findAndUpdate (query, set) {
    try {
      return await Analytics.findOneAndUpdate(query, { $set: set }, { new: true })
    } catch (reason) {
      console.error('[AnalyticsManagement (Update)] An error ocurred while updating analytics [%s]', reason.message)
    }
  }

    /**
     * Delete Analytics
     * @param _id => Analytics Identifier
     */
  async delete (_id) {
    return new Promise((resolve, reject) => {
      Analytics.findOneAndRemove({ _id }, (error, analyticsDeleted) => {
        if (error) { reject(error) } else { resolve(analyticsDeleted) }
      })
    })
  }
}

module.exports = new AnalyticsManagement()
