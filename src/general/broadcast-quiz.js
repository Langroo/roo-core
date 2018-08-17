const usersManagement = require('../database/user').management
const redisManagement = require('../cache')
const crypto = require('crypto')
const generateHash = (str) => crypto.createHash('md5').update(str).digest('hex')

class broadcastQuiz {

  static async setContextInBot (awaitingAnswerStatus) {
    const users = await usersManagement.retrieve()
    for (const user of users) {
      const userHash = generateHash(user.senderId)
      if (awaitingAnswerStatus) {
        await redisManagement.hashSetUser(userHash, 'awaiting_answer', '1')
          .catch(err => console.log(err))
        await redisManagement.hashSetUser(userHash, 'current_pos', 'quiz')
          .catch(err => console.log(err))
      } else {
        await redisManagement.hashSetUser(userHash, 'awaiting_answer', '0')
          .catch(err => console.log(err))
        await redisManagement.hashSetUser(userHash, 'current_pos', 'fallback')
          .catch(err => console.log(err))
      }
    }
  }

}

module.exports = broadcastQuiz
