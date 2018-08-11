/**
 * Dependencies
 */
const Schedule = require('./schedule.model');

class ScheduleManagement {

  /**
   * Create new Schedule
   */
  async create (scheduleModel) {
    return new Promise((resolve, reject) => {
            // -- Create new Schedule
      const schedule = new Schedule(scheduleModel);

            // -- Save Schedule
      schedule.save((error) => {
        if (error) { reject(error) } else { resolve(schedule) }
      })
    })
  }

  /**
   * Retrieve Schedule
   */
  async retrieve (query = {}, findOne = false) {
    return new Promise((resolve, reject) => {
      if (!findOne) {
        Schedule.find(query, (error, ScheduleFound) => {
          if (error) { reject(error) } else { resolve(ScheduleFound) }
        }).lean()
      } else {
        Schedule.findOne(query, (error, ScheduleFound) => {
          if (error) { reject(error) } else { resolve(ScheduleFound) }
        }).lean()
      }
    })
  }

    /**
     * Update Schedule
     */
  async update (_id, set) {
    try {
      return await Schedule.findOneAndUpdate({ _id }, { $set: set }, { new: true })
    } catch (reason) {
      console.log('An error ocurred while updating schedule');
      return reason
    }
  }

  async pull (_id, pull) {
    try {
      return await Schedule.findOneAndUpdate({ _id }, { $pull: pull }, { new: true })
    } catch (reason) {
      console.log('An error ocurred while updating schedule');
      return reason
    }
  }

    /**
     * Delete Schedule
     */
  async delete (_id) {
    try {
      return await Schedule.findOneAndRemove({ _id })
    } catch (reason) {
      console.log('An error ocurred while deleting schedule');
      return reason
    }
  }


  async deleteAll () {
    try {
      return await Schedule.remove({})
    } catch (error) {
      return error
    }
  }
}

module.exports = new ScheduleManagement();
