// -- Api calls to facebook
const axios = require('axios')
const mongoose = require('mongoose')

/**
 * Local Dependencies
 * */
const UsersManagement = require('../../database/index').UsersManagement
const userCollection = mongoose.connection.collection('user')

class messaging {

  static async removeUserFromLabel (senderId, LabelName) {
    let labelId
    const labelsIdsArray = (await axios.get(`${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/custom_labels?fields=name&access_token=${process.env.FB_ACCESS_TOKEN}`)).data.data
    for (const labelData of labelsIdsArray) {
      if (labelData.name === LabelName) {
        labelId = labelData.id
      }
    }

    await axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${labelId}/label?user=${senderId}access_token=${process.env.FB_ACCESS_TOKEN}`,
      method: 'delete',
    })
      .catch(error => {
        console.log('Error removing USER from LABEL in FACEBOOK ::\n', error.response.data)
      })
  }

  static async assignUserToLabel (senderId, LabelName) {
    let labelId

    const labelsIdsArray = (await axios.get(`${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/custom_labels?fields=name&access_token=${process.env.FB_ACCESS_TOKEN}`)).data.data
    for (const labelData of labelsIdsArray) {
      if (labelData.name === LabelName) {
        labelId = labelData.id
      }
    }

    await axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${labelId}/label?access_token=${process.env.FB_ACCESS_TOKEN}`,
      method: 'post',
      data: `{"user":${senderId}}`,
    })
      .catch(error => {
        console.log('Error assigning USER to LABEL in FACEBOOK ::\n', error.response.data)
      })
  }

  static async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  static async monthlyActiveUsers () {
    const MAUCursor = await userCollection.find({
      lastInteraction: { $gte: new Date(((new Date()).getTime()) - 2592000000),
        $lte: new Date((new Date()).getTime()) },
      'subscription.status': 'ACTIVE' }).count()
    const MAU = MAUCursor
    return MAU
  }

  static async dailyActiveUsersAvg () {
    let DAUCursor
    let average
    const daysForAverage = 7
    const valuesPerDay = []
    for (let i = 0; i < daysForAverage; i++) {
      DAUCursor = await userCollection.find({
        lastInteraction: { $gte: new Date(((new Date()).getTime()) - ((i + 1) * 86400000)),
          $lte: new Date((new Date()).getTime()) },
        'subscription.status': 'ACTIVE' }).count()
      valuesPerDay[i] = DAUCursor
    }
    average = (valuesPerDay.reduce((acc, val) => { return acc + val })) / daysForAverage
    average = Math.floor(average)
    return average
  }

  static async registrationsLast24Hours () {
    const registrationsCursor = await userCollection.find({
      FirstSubscriptionDate: { $gte: new Date(((new Date()).getTime()) - 86400000),
        $lte: new Date((new Date()).getTime()) },
      'subscription.status': 'ACTIVE' }).count()
    const registrations = registrationsCursor
    return registrations
  }

  static async retrieveBroadcastLabel (senderId) {
    let BroadcastLabels
    if (senderId) {
      // -- Retrieves all labels associated with a PSID
      try {
        BroadcastLabels = (await axios.get(`${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${senderId}/custom_labels?access_token=${process.env.FB_ACCESS_TOKEN}`)).data.data
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.info('The categories of this user to send broadcast messages are :: ', BroadcastLabels) }
      } catch (reason) {
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Error requesting Broadcast Labels from Facebook :: \n--> %s\n--> Status Code: %s', reason.response.statusText, reason.response.status) }
        return false
      }
    } else {
      // -- If no ID was provided, return all labels created
      try {
        BroadcastLabels = (await axios.get(`${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/custom_labels?fields=name&access_token=${process.env.FB_ACCESS_TOKEN}`)).data.data
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.info('The user categories to send broadcast messages are :: \n', BroadcastLabels) }
      } catch (error) {
        console.log('Error requesting Broadcast Labels from Facebook ::\n', error.response.data)
        return false
      }
    }
    return BroadcastLabels
  }

  static async deleteBroadcastLabel () {
    await messaging.retrieveBroadcastLabel()
      .catch(() => console.error('❌❌❌❌ Retrieval of Broadcast Labels to Delete FAILED ❌❌❌❌'))
      .then(async(labelsToDelete) => {
        let res
        await this.asyncForEach(labelsToDelete, async(element) => {
          try {
            res = (await axios.delete(
              `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${element.id}?access_token=${process.env.FB_ACCESS_TOKEN}`, { headers: { 'Content-Type': 'application/json' } }
            )).data
            if (res.success) {
              if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Label [%s] for targeted Broadcast Messaging was deleted successfully', element.name) }
            } else if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.info('INFO: Label [%s] for targeted Broadcast Messaging could not be deleted', element.name) }
          } catch (error) {
            if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.error('Error deleting Broadcast Labels from Facebook ::\n', error.response.data) }
          }
        })
      })
      .catch(err => console.error('ERROR DELETING THE LABELS ::', err))
  }

  static async createBroadcastLabel () {

    const labelsToCreate = ['UNREGISTERED', 'ACTIVE', 'INACTIVE', 'UNSUBSCRIBED', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

    // -- Delete current broadcast labels if there are any
    await messaging.deleteBroadcastLabel()
    // -- create the labels again
    for (const label of labelsToCreate) {
      await axios.request({
        headers: { 'Content-Type': 'application/json' },
        url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/custom_labels?access_token=${process.env.FB_ACCESS_TOKEN}`,
        method: 'post',
        data: `{"name": "${label}"}`,
      })
        .catch(error => {
          console.log('Error requesting creation of Broadcast Messaging Labels on Facebook ::\n', error.response.data)
        })
    }
  }

  static async userStatusLabels () {

    let labelName
    let labelId
    let userAssigned
    let activeUsers = 0
    let inactiveUsers = 0
    let unregisteredUsers = 0
    let unsubscribedUsers = 0
    const statusUnknown = []
    let successfullyAssigned = 0
    const usersList = await UsersManagement.retrieve()
    const existingLabels = await this.retrieveBroadcastLabel()
    // -- Assign each user in the database to a label
    await this.asyncForEach(usersList, async(user) => {

      if (user.subscription.status === 'UNREGISTERED') {
        labelName = 'UNREGISTERED'
      } else if (user.subscription.status === 'UNSUBSCRIBED') {
        labelName = 'UNSUBSCRIBED'
      } else if (user.subscription.status === 'ACTIVE') {
        labelName = 'ACTIVE'
      } else if (user.subscription.status === 'INACTIVE') {
        labelName = 'INACTIVE'
      }
      try {
        await this.asyncForEach(existingLabels, async(element) => {
          if (labelName === element.name) {
            if (labelName === 'UNREGISTERED') {
              unregisteredUsers++
            } else if (labelName === 'UNSUBSCRIBED') {
              unsubscribedUsers++
            } else if (labelName === 'ACTIVE') {
              activeUsers++
            } else if (labelName === 'INACTIVE') {
              inactiveUsers++
            }
            labelId = element.id
            if (user.senderId) {
              userAssigned = await axios.request({
                headers: { 'Content-Type': 'application/json' },
                url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${labelId}/label?access_token=${process.env.FB_ACCESS_TOKEN}`,
                method: 'post',
                data: `{"user":${user.senderId}}`,
              })
            }
          }
        })
        if (userAssigned) {
          successfullyAssigned++
        } else {
          statusUnknown.push(user.name.full_name)
        }
      } catch (error) {
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Error Sending REQUEST to Facebook ::\n', error.response.data) }
      }
    })
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Assignment of users to broadcast labels by status completed ✔\nTotal Successful :: [%s]\nActive Users :: [%s]\nInactive Users :: [%s]\nUnregistered Users :: [%s]\nUnsubscribed Users :: [%s]\nStatus Unknown :: [%s]', successfullyAssigned, activeUsers, inactiveUsers, unregisteredUsers, unsubscribedUsers, statusUnknown) }
  }

  static async userLevelLabels () {

    let labelName
    let labelId
    let userAssigned
    let userBeginnerCount = 0
    let userIntermediateCount = 0
    let userAdvancedCount = 0
    const userNotAssigned = []
    let successfullyAssigned = 0
    const usersList = await UsersManagement.retrieve()
    const existingLabels = await this.retrieveBroadcastLabel()
    // -- Assign each user in the database to a label
    await this.asyncForEach(usersList, async(user) => {

      // -- Verify that the data from the database is consistent
      // -- This is according to the current model of User in MongoDB
      // -- Current correctUser must be user.content.plan.accent & user.content.plan.level
      let correctUser = user.content
      correctUser ? correctUser = correctUser.plan : correctUser = {}
      correctUser ? correctUser : correctUser = {}

      if (correctUser.level) {

        if (user.content.plan.level === 'beginner') {
          labelName = 'BEGINNER'
        } else if (user.content.plan.level === 'intermediate') {
          labelName = 'INTERMEDIATE'
        } else if (user.content.plan.level === 'advanced') {
          labelName = 'ADVANCED'
        }
        try {
          await this.asyncForEach(existingLabels, async(element) => {
            if (labelName === element.name) {
              if (labelName === 'BEGINNER') {
                userBeginnerCount++
              } else if (labelName === 'INTERMEDIATE') {
                userIntermediateCount++
              } else if (labelName === 'ADVANCED') {
                userAdvancedCount++
              }
              labelId = element.id
              if (user.senderId) {
                userAssigned = await axios.request({
                  headers: { 'Content-Type': 'application/json' },
                  url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${labelId}/label?access_token=${process.env.FB_ACCESS_TOKEN}`,
                  method: 'post',
                  data: `{"user":${user.senderId}}`,
                })
              }
            }
          })

          if (userAssigned) {
            successfullyAssigned++
          } else {
            userNotAssigned.push(user.name.full_name)
          }

        } catch (error) {
          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Error Sending REQUEST to Facebook ::\n', error.response.data) }
        }
      }
    })
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Assignment of users to broadcast labels by level completed ✔\nTotal Successful :: [%s]\nBeginner Level :: [%s]\nIntermediate Level :: [%s]\nAdvanced Level :: [%s]\nFailed to assign :: [%s]', successfullyAssigned, userBeginnerCount, userIntermediateCount, userAdvancedCount, userNotAssigned) }
  }

  static async dailyReportToSlack () {
    const MAU = await this.monthlyActiveUsers()
    const DAU = await this.dailyActiveUsersAvg()
    const registrationsLast24Hours = await this.registrationsLast24Hours()
    try {
      axios.request({
        headers: { 'Content-Type': 'application/json' },
        url: 'https://hooks.slack.com/services/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',
        method: 'post',
        data: `{"text":"Your daily stats from Roo:\n*Monthly Active Users:* ${MAU}\n *Daily Active Users (Last 7 days average):* ${DAU}\n *New Registrations in last 24 hours:* ${registrationsLast24Hours}"}`,
      })
        .then(() => console.info('#################################\nDAILY REPORT HAS BEEN SENT TO SLACK SUCCESSFULLY\n#################################'))
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('User report send correctly.') }
    } catch (reason) {
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('(╯°□°）╯︵ ┻━┻ ERROR sending the notification to SLACK :: ', reason) }
    }
  }

}

module.exports = {
  messaging,
}
