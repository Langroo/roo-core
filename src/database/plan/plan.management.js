/**
 * Dependencies
 */
const mongoose = require('mongoose');
const Plan = require('./plan.model');
const planCollection = mongoose.connection.collection('plan');

class PlanManagement {
  /**
   * Create
   */
  async create(planModel) {
    try {
      const plan = new Plan(planModel);
      await plan.save();
      return plan;
    } catch (reason) {
      console.log('An error occurred while creating new plan ', reason);
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
      if (!options.findOne) { return await Plan.find(options.query).lean(); } if (options.findOne) { return await Plan.findOne(options.query).lean(); }
    } catch (reason) {
      console.log('An error occurred while retrieve plan ', reason);
    }
  }

  /**
   * Update User
   */
  async update(plan_id, set) {
    try {
      return await Plan.findOneAndUpdate({ plan_id }, { $set: set }, { new: true });
    } catch (reason) {
      console.log('An error occurred while updating plan ', reason);
    }
  }

  /**
   * Delete
   */
  async delete(plan_id) {
    try {
      return await Plan.findOneAndRemove({ plan_id });
    } catch (reason) {
      console.log('An error occurred while deleting plan ', reason);
    }
  }
}

module.exports = new PlanManagement();
