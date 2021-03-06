/**
 * Dependencies
 */
const User = require('./user.model');

class UsersManagement {
  async create(userModel, params = { updateIfExist: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!params.updateIfExist)
        // -- Save user
        { resolve(await (new User(userModel)).save()); } else {
          // -- FindOne and Update
          const user = await User.findOneAndUpdate({ _id: userModel._id }, { $set: userModel }, { new: true });
          resolve(user === null || user === undefined ? await (new User(userModel)).save() : user);
        }
      } catch (reason) {
        console.log('An error ocurred while creating the user');
        reject(reason);
      }
    });
  }

  /**
     * Retrieve Users
     */
  async retrieve(options = {
    query: {},
    findOne: false,
  }) {
    return new Promise((resolve, reject) => {
      if (!options.findOne) {
        // -- Returns an ARRAY
        User.find(options.query, (error, usersFound) => {
          if (error) {
            reject(error);
          } else { resolve(usersFound); }
        }).lean();
      } else {
        User.findOne(options.query, (error, userFound) => {
          if (error) {
            reject(error);
          } else { resolve(userFound); }
        }).lean();
      }
    });
  }

  async update(_id, set) {
    try {
      return await User.findOneAndUpdate({ _id }, { $set: set }, { new: true });
    } catch (reason) {
      console.log('An error ocurred while updating user ', reason);
    }
  }

  async findAndUpdate(query, set) {
    try {
      return await User.findOneAndUpdate(query, { $set: set }, { new: true });
    } catch (reason) {
      console.log('An error ocurred while updating user ', reason);
    }
  }

  async increment(_id, field, inc) {
    try {
      const obj = {};
      obj[field] = inc;
      return await User.update({ _id }, { $inc: obj }, { new: true });
    } catch (reason) {
      console.log('An error ocurred while updating user ', reason);
      return null;
    }
  }

  /**
     * Delete User
     * @param id => User fb id
     */
  async delete(id) {
    return new Promise((resolve, reject) => {
      User.findOneAndRemove({ id }, (error, UserDeleted) => {
        if (error) { reject(error); } else { resolve(UserDeleted); }
      });
    });
  }
}

module.exports = new UsersManagement();
