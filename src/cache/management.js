const redis = require('./connect');

class RedisManagement {
  /**
   * hmset to store a user hash
   */
  async hashSetUser(userHash, key, value) {
    try {
      return await (await redis).hset(`user:${userHash}`, key, value);
    } catch (error) {
      console.log('An error ocurred :: ', error);
    }
  }

  /**
   * hdel user
   */
  async hashDelUser(userHash) {
    try {
      await (await redis).del(`user:${userHash}`).then(res => console.log('User deleted from redis: ', res));
    } catch (error) {
      console.log('An error occurred :: ', error);
    }
  }

  /**
   * Get all the hash keys
   */
  async hashGetUser(userHash) {
    return new Promise(async (resolve, reject) => {
      try {
        (await redis).hgetall(`user:${userHash}`, (error, user) => {
          if (error) {
            return reject(error);
          }
          return resolve(user);
        });
      } catch (error) {
        console.log('An error occurred :: ', error);
        return reject(error);
      }
    });
  }

  async setUserCache(dataObject, propertyName) {
    try {
      const { userHash } = dataObject;
      const userValue = dataObject[propertyName];

      if (!userHash) {
        throw new Error('userHash missing in data object received');
      }
      if (!userValue) {
        throw new Error('userValue missing in data object received');
      }

      const create = await this.hashSetUser(userHash, propertyName, userValue);
      if (!create) {
        throw new Error('[Redis] Error while creating');
      }
      const retrieve = await this.hashGetUser(userHash);

      return { statusMessage: 'created', statusCode: 201, data: retrieve };
    } catch (reason) {
      if (reason.response) {
        console.error(
          '(╯°□°）╯ ERROR STORING USER CACHE :: \n--> %s\n--> Status Code: %s',
          reason.response.statusText,
          reason.response.status,
        );
        return reason;
      }
      console.error('(╯°□°）╯ ERROR STORING USER CACHE :: \n', reason);
      return reason;
    }
  }
}

module.exports = RedisManagement;
