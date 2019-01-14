/**
 * Dependencies
 */
const UserMetadata = require('./user-metadata.model');

class UsersMetadataManagement {
  async create(userMetadataModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist) {
          // -- Save user
          resolve(await (new UserMetadata(userMetadataModel)).save());
        } else {
          // -- FindOne and Update
          const userMetadata = await UserMetadata.findOneAndUpdate({ _id: userMetadataModel._id }, { $set: userMetadataModel }, { new: true });
          resolve(userMetadata === null || userMetadata === undefined ? await (new UserMetadata(userMetadataModel)).save() : userMetadata);
        }
      } catch (reason) {
        console.log('[UserMetadataManagement (Update)] An error ocurred while creating user metadata [%s]', reason.message);
        reject(reason);
      }
    });
  }

  /**
     * Retrieve UsersMetadata
     */
  async retrieve(options = {
    query: {},
    findOne: false,
  }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        UserMetadata.find(options.query, (error, usersMetadataFound) => {
          if (error) {
            reject(error);
          } else { resolve(usersMetadataFound); }
        }).lean();
      } else {
        UserMetadata.findOne(options.query, (error, userMetadataFound) => {
          if (error) {
            reject(error);
          } else { resolve(userMetadataFound); }
        }).lean();
      }
    });
  }

  /**
     * Update User
     */
  async update(_id, set, personalized) {
    try {
      if (personalized) {
        return await UserMetadata.findOneAndUpdate({ _id }, set);
      }
      return await UserMetadata.findOneAndUpdate({ _id }, { $set: set }, { new: true });
    } catch (reason) {
      console.error('[UserMetadataManagement (Update)] An error ocurred while updating user metadata [%s]', reason.message);
    }
  }

  async findAndUpdate(query, set) {
    try {
      return await UserMetadata.findOneAndUpdate(query, { $set: set }, { new: true });
    } catch (reason) {
      console.error('[UserMetadataManagement (Update)] An error occurred while updating user [%s]', reason.message);
    }
  }

  /**
     * Delete UserManagement
     * @param _id => User Management Identifier
     */
  async delete(_id) {
    return new Promise((resolve, reject) => {
      UserMetadata.findOneAndRemove({ _id }, (error, UserMetadataDeleted) => {
        if (error) {
          reject(error);
        } else {
          resolve(UserMetadataDeleted);
        }
      });
    });
  }
}

module.exports = new UsersMetadataManagement();
