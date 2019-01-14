/**
 * Dependencies
 */
const mongoose = require('mongoose');
const Subscription = require('./subscription.model');

class SubscriptionManagement {
  /**
   * Create
   */
  async create(subscriptionModel) {
    try {
      const subscription = new Subscription(subscriptionModel);
      await subscription.save();
      return subscription;
    } catch (reason) {
      console.log('An error occurred while creating new subscription ', reason);
    }
  }

  /**
   * Retrieve
   */
  async retrieve(options = {
    query: {},
    findOne: false,
  }) {
    try {
      if (!options.findOne) { return await Subscription.find(options.query).lean(); } if (options.findOne) { return await Subscription.findOne(options.query).lean(); }
    } catch (reason) {
      console.log('An error occurred while retrieve subscription ', reason);
    }
  }

  /**
   * Update Subscription
   */
  async update(subscription_id, set) {
    try {
      return await Subscription.findOneAndUpdate({ subscription_id }, { $set: set }, { new: true });
    } catch (reason) {
      console.log('An error occurred while updating subscription ', reason);
    }
  }

  async findAndUpdate(query, set) {
    try {
      return await Subscription.findOneAndUpdate(query, { $set: set }, { new: true });
    } catch (reason) {
      console.log('An error ocurred while updating subscription ', reason);
    }
  }

  /**
   * Delete
   */
  async delete(subscription_id) {
    try {
      return await Subscription.findOneAndRemove({ _id: subscription_id });
    } catch (reason) {
      console.log('An error occurred while deleting subscription ', reason);
    }
  }
}

module.exports = new SubscriptionManagement();
