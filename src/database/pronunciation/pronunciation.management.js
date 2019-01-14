/**
 * Dependencies
 */
const Pronunciation = require('./pronunciation.model');

class PronunciationManagement {
  /**
     * Create pronunciation model
     * @param {*} pronunciationModel
     * @param {*} params
     */
  async create(pronunciationModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist) {
          // -- Save pronunciation
          resolve(await (new Pronunciation(pronunciationModel)).save());
        } else {
          // -- FindOne and Update
          const pronunciationId = pronunciationModel._id;
          delete pronunciationModel._id;
          const pronunciation = await Pronunciation.findOneAndUpdate({ _id: pronunciationId }, { $set: pronunciationModel }, { new: true });
          resolve(pronunciation === null || pronunciation === undefined ? await (new Pronunciation(pronunciationModel)).save() : pronunciation);
        }
      } catch (reason) {
        console.log('[PronunciationManagement (Update)] An error ocurred while creating pronunciation [%s]', reason.message);
        reject(reason);
      }
    });
  }

  /**
     * Retrieve Pronunciation
     */
  async retrieve(options = {
    query: {},
    findOne: false,
  }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        Pronunciation.find(options.query, (error, pronunciationsFound) => {
          if (error) {
            reject(error);
          } else { resolve(pronunciationsFound); }
        }).lean();
      } else {
        Pronunciation.findOne(options.query, (error, pronunciationFound) => {
          if (error) {
            reject(error);
          } else { resolve(pronunciationFound); }
        }).lean();
      }
    });
  }


  /**
     * Update Pronunciation
     */
  async update(_id, set) {
    try {
      return await Pronunciation.findOneAndUpdate({ _id }, { $set: set }, { new: true });
    } catch (reason) {
      console.error('[Pronunciation (Update)] An error ocurred while updating pronunciation [%s]', reason.message);
    }
  }

  async findAndUpdate(query, set) {
    try {
      return await Pronunciation.findOneAndUpdate(query, { $set: set }, { new: true });
    } catch (reason) {
      console.error('[PronunciationManagement (Update)] An error ocurred while updating pronunciation [%s]', reason.message);
    }
  }

  /**
     * Delete Pronunciation
     * @param _id => Pronunciation Identifier
     */
  async delete(_id) {
    return new Promise((resolve, reject) => {
      Pronunciation.findOneAndRemove({ _id }, (error, pronunciationDeleted) => {
        if (error) { reject(error); } else { resolve(pronunciationDeleted); }
      });
    });
  }
}

module.exports = new PronunciationManagement();
