/**
 * Dependencies
 */
const Login = require('./login.model');

class LoginManagement {
  /**
     * Create new Login
     * @param id => ID of the user
     * @param token => Token of the user
     * @param email => Email of the user
     * @param name => Name of the user
     */
  create(loginModel) {
    return new Promise((resolve, reject) => {
      // -- Create new Login
      const login = new Login(loginModel);

      // -- Save Login
      login.save((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(login);
        }
      });
    });
  }

  /**
     * Retrieve Logins
     */
  retrieve(query = {}, findOne = false) {
    return new Promise((resolve, reject) => {
      if (!findOne) {
        Login.find(query, (error, LoginFound) => {
          if (error) {
            reject(error);
          } else {
            resolve(LoginFound);
          }
        }).lean();
      } else {
        Login.findOne(query, (error, LoginFound) => {
          if (error) {
            reject(error);
          } else {
            resolve(LoginFound);
          }
        }).lean();
      }
    });
  }

  /**
     * Update Login
     * @param id => ID of the user
     * @param token => Token of the user
     * @param email => Email of the user
     * @param name => Name of the user
     */
  update(id, loginModel) {
    return new Promise((resolve, reject) => {
      Login.findOneAndUpdate({ id }, loginModel, { new: true }, (error, loginUpdated, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(loginUpdated);
        }
      });
    });
  }

  /**
     * Delete Login
     * @param id => Login fb id
     */
  delete(id) {
    return new Promise((resolve, reject) => {
      Login.findOneAndRemove({ id }, (error, LoginDeleted) => {
        if (error) {
          reject(error);
        } else {
          resolve(LoginDeleted);
        }
      });
    });
  }
}

module.exports = new LoginManagement();
