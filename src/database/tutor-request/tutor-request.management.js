/**
 * Dependencies
 */
const mongoose = require('mongoose');

// -- Local dependencies
const TutorRequest = require('./tutor-request.model');
const tutorCollection = mongoose.connection.collection('tutor_request');

class TutorRequestManagement {
  /**
   * Create
   */
  async create(tutorRequestModel) {
    return new Promise((resolve, reject) => {
      // -- Create new TutorRequest
      const tutorRequest = new TutorRequest(tutorRequestModel);

      // -- Save Schedule
      tutorRequest.save((error) => {
        if (error) { reject(error); } else { resolve(tutorRequest); }
      });
    });
  }

  /**
   * Retrieve
   */
  async retrieve(options = {
    query: {},
    findOne: false,
  }) {
    try {
      if (!options.findOne) { return await TutorRequest.find(options.query); } if (options.findOne) { return await TutorRequest.findOne(options.query); }
    } catch (reason) {
      console.log('An error occurred while retrieving a tutor request ', reason);
    }
  }

  /**
   * Retrieve & JOIN With USER
   */
  async retrieveWithUsers() {
    try {
      return (await tutorCollection.aggregate([
        {
          $lookup: {
            from: 'user',
            localField: 'user_id',
            foreignField: 'senderId',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
      ]).toArray());
    } catch (reason) {
      console.log('An error occurred while retrieving a tutor request ', reason);
    }
  }

  /**
   * Update
   */
  async update(_id, set) {
    try {
      return await TutorRequest.findOneAndUpdate({ _id }, { $set: set }, { new: true });
    } catch (reason) {
      console.log('An error occurred while deleting a tutor request ', reason);
    }
  }

  /**
   * Delete
   */
  async delete(senderId) {
    try {
      return await TutorRequest.findOneAndRemove({ senderId });
    } catch (reason) {
      console.log('An error occurred while deleting a tutor request ', reason);
    }
  }
}

module.exports = new TutorRequestManagement();
