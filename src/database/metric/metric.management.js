/**
 * Dependencies
 */
const Metric = require('./metric.model');

class MetricsManagement {
  /**
     * Create metric model
     * @param {*} metricModel
     * @param {*} params
     */
  async create(metricModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist) {
          // -- Save metric
          resolve(await (new Metric(metricModel)).save());
        } else {
          // -- FindOne and Update
          const metricId = metricModel._id;
          delete metricModel._id;
          const metric = await Metric.findOneAndUpdate({ _id: metricId }, { $set: metricModel }, { new: true });
          resolve(metric === null || metric === undefined ? await (new Metric(metricModel)).save() : metric);
        }
      } catch (reason) {
        console.log('[MetricManagement (Update)] An error ocurred while creating metric [%s]', reason.message);
        reject(reason);
      }
    });
  }

  /**
     * Retrieve Metric
     */
  async retrieve(options = {
    query: {},
    findOne: false,
  }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        Metric.find(options.query, (error, metricFound) => {
          if (error) {
            reject(error);
          } else { resolve(metricFound); }
        }).lean();
      } else {
        Metric.findOne(options.query, (error, metricFound) => {
          if (error) {
            reject(error);
          } else { resolve(metricFound); }
        }).lean();
      }
    });
  }


  /**
     * Update Metric
     */
  async update(_id, set) {
    try {
      return await Metric.findOneAndUpdate({ _id }, { $set: set }, { new: true });
    } catch (reason) {
      console.error('[Metric (Update)] An error ocurred while updating metric [%s]', reason.message);
    }
  }

  async findAndUpdate(query, set) {
    try {
      return await Metric.findOneAndUpdate(query, { $set: set }, { new: true });
    } catch (reason) {
      console.error('[Metric (Update)] An error ocurred while updating metric [%s]', reason.message);
    }
  }

  /**
     * Delete Metric
     * @param _id => Metric Identifier
     */
  async delete(_id) {
    return new Promise((resolve, reject) => {
      Metric.findOneAndRemove({ _id }, (error, metricDeleted) => {
        if (error) { reject(error); } else { resolve(metricDeleted); }
      });
    });
  }
}

module.exports = new MetricsManagement();
