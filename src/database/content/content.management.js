/**
 * Dependencies
 */
const Content = require('./content.model');

class ContentManagement {
  /**
     * Create new Content
     */
  create(contentModel) {
    return new Promise((resolve, reject) => {
      // -- Create new Content
      const content = new Content(contentModel);

      // -- Save Content
      content.save((error) => {
        if (error) { reject(error); } else { resolve(content); }
      });
    });
  }

  /**
     * Retrieve Contents
     */
  async retrieve(options = {
    query: {},
    findOne: false,
    getCollection: false,
  }) {
    try {
      if (options.getCollection) { return await Content.collection; } // -- Custom query
      if (options.findOne) { return await Content.findOne(options.query); } // -- FindOne query
      await Content.find(options.query); // -- Find query
    } catch (reason) {
      console.log('An error ocurred on retrieve data');
      console.log('Details: ', reason);
    }
  }

  /**
     * Update Content
     */
  update(id, contentModel) {
    return new Promise((resolve, reject) => {
      Content.findOneAndUpdate({ id }, contentModel, { new: true }, (error, contentUpdated, response) => {
        if (error) { reject(error); } else { resolve(contentUpdated); }
      });
    });
  }

  /**
     * Delete Content
     */
  delete(_id) {
    return new Promise((resolve, reject) => {
      Content.findOneAndRemove({ _id }, (error, locationDeleted) => {
        if (error) { reject(error); } else { resolve(locationDeleted); }
      });
    });
  }

  /**
     * Clear schema
     * DANGER ZONE
     */
  async clear() {
    return new Promise((resolve, reject) => {
      Content.remove({}, (error) => {
        if (error) { reject(error); } else { resolve('Schema is deleted'); }
      });
    });
  }

  /**
     * Add multiple
     */
  async createMultiple(objectsArray) {
    return new Promise((resolve, reject) => {
      Content.insertMany(objectsArray, (error, insertedRows) => {
        if (error) { reject(error); } else { resolve(insertedRows); }
      });
    });
  }
}

module.exports = new ContentManagement();
