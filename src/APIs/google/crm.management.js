/**
 * ==================================================================
 * Manage schema, complete CRUD
 * ==================================================================
 */
const mongoose = require('mongoose')
const googlesheet = require('./sheet')
const maps = require('../../general/index').maps

/** *
 * Auxiliary functions
 */
const setTimeout = require('timers').setTimeout
const bufferSize = 1
const timeBetweenRequests = 4000
const messageTimer = ms => { return new Promise(resolve => setTimeout(resolve, ms)) }

/**
 * DB Instances | Collections
 */
const userCollection = mongoose.connection.collection('user')
const tutorRequestCollection = mongoose.connection.collection('tutor_request')
const analyticsCollection = mongoose.connection.collection('analytics')

class CRM {

  async addNewProfileRecord (senderId) {
    try {

      // -- Retrieve Sheets
      const mainProfileSheet = new googlesheet('profile-main')
      const detailedProfileSheet = new googlesheet('profile-detailed')

      // -- Retrieve data
      const usersCursor = userCollection.aggregate([
        {
          $match: {
            senderId,
          },
        },
        {
          $lookup: {
            from: 'user-metadata',
            localField: '_id',
            foreignField: '_id',
            as: 'metadata',
          },
        },
        {
          $lookup: {
            from: 'tutor_request',
            localField: 'senderId',
            foreignField: 'user_id',
            as: 'tutor_request',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            picture: 1,
            gender: 1,
            language: 1,
            location: 1,
            subscription_date: '$FirstSubscriptionDate',
            subscription: 1,
            content: 1,
            senderId: 1,
            metadata: { $arrayElemAt: ['$metadata', 0] },
            tutor_request: { $arrayElemAt: ['$tutor-request', 0] },
          },
        },
      ])
      const buffer = 0
      const user = await usersCursor.next()
      if (!user) { throw new Error(`No user found with senderId [${senderId}]`) }
      // -- Add row in main profile sheet
      await mainProfileSheet.create({
        name: user.name.full_name,
        age_range: user.metadata ? user.metadata.age : 'Not completed',
        gender: user.gender,
        language: user.language,
        location: user.location.name || 'Unavailable without Facebook Login',
        source_type: user.metadata ? user.metadata.source_type : 'Not completed',
        source_name: user.metadata ? user.metadata.source_name : 'Not completed',
        motivation: user.metadata ? user.metadata.motivation_to_learn_english : 'Not completed',
        interests: user.metadata ? user.metadata.biggest_interests_personal : 'Not completed',
        status: user.subscription.status,
        nps: user.metadata ? user.metadata.rating_value : 'Not completed',
        date_message_us: user.subscription_date,
        tutor_requested: user.tutor_request ? 'Yes' : 'No',
      })
      // -- Add row in detailed profile sheet
      await detailedProfileSheet.create({
        name: user.name.full_name,
        first_name: user.name.first_name,
        last_name: user.name.last_name,
        picture: user.picture,
        age_range: user.metadata ? user.metadata.age : 'Not completed',
        gender: user.gender,
        language: user.language,
        location: user.location.name || 'Unavailable without Facebook Login',
        accent: user.content ? user.content.plan.accent : 'Not completed',
        level: user.content ? user.content.plan.level : 'Not completed',
        source_type: user.metadata ? user.metadata.source_type : 'Not completed',
        source_name: user.metadata ? user.metadata.source_name : 'Not completed',
        motivation: user.metadata ? user.metadata.motivation_to_learn_english : 'Not completed',
        interests: user.metadata ? user.metadata.biggest_interests_personal : 'Not completed',
        date_message_us: user.subscription_date,
        time_message_us: user.subscription_date,
        birthday: 'Unavailable without Facebook Login',
        profile_link: 'Unavailable without Facebook Login',
        email: 'Unavailable without Facebook Login',
        status: user.subscription.status,
        nps: user.metadata ? user.metadata.rating_value : 'Not completed',
        tutor_requested: user.tutor_request ? 'Yes' : 'No',
      })

      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.info('New profile data stored in GoogleSheets for user :: [%s]', user.name.full_name)
      }

    } catch (error) {
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.error('Error saving the new user data on GoogleSheets CRM [Profile]')
      }
      if (error) {
        console.error('Reason [%s]', error.message)
      } else {
        console.error('Reason [%s]', error)
      }
    }
  }

  /**
   * =====================================================
   * profileFullUpdate
   *  Description: Updates User profile in CRM, executes a
   *  clear on all sheets involved and recreates the data
   * =====================================================
   */
  async profileFullUpdate () {
    let successfullySaved = 0
    try {
            // -- Retrieve Sheets
      const mainProfileSheet = new googlesheet('profile-main')
      const detailedProfileSheet = new googlesheet('profile-detailed')

            // -- Delete from profile
      await mainProfileSheet.delete()
      await detailedProfileSheet.delete()

            // -- Retrieve data
      const usersCursor = userCollection.aggregate([
        {
          $lookup: {
            from: 'user-metadata',
            localField: '_id',
            foreignField: '_id',
            as: 'metadata',
          },
        },
        {
          $lookup: {
            from: 'tutor_request',
            localField: 'senderId',
            foreignField: 'user_id',
            as: 'tutor_request',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            picture: 1,
            gender: 1,
            language: 1,
            location: 1,
            subscription_date: '$FirstSubscriptionDate',
            subscription: 1,
            content: 1,
            senderId: 1,
            metadata: { $arrayElemAt: ['$metadata', 0] },
            tutor_request: { $arrayElemAt: ['$tutor-request', 0] },
          },
        },
      ])
      let user

      // -- Prepare schemas
      /**
       * ====================================================
       * Profile Main
       *
       *  - name
       *  - age_range
       *  - gender
       *  - language
       *  - location
       *  - source
       *  - motivation
       *  - interests
       *  - status
       *  - nps
       *  - date_message_us
       *  - tutor_requested
       * ====================================================
       */

      /**
       * ====================================================
       * Profile Detailed
       *
       *  - name
       *  - first_name
       *  - last_name
       *  - picture
       *  - age_range
       *  - gender
       *  - language
       *  - location
       *  - accent
       *  - level
       *  - source
       *  - motivation
       *  - interests
       *  - date_message_us
       *  - time_message_us
       *  - birthday
       *  - profile_link
       *  - email
       *  - status
       *  - nps
       *  - tutor_requested
       * =====================================================
       */

      let buffer = 0
      while ((user = await usersCursor.next())) {
        if (buffer === bufferSize) {
          await messageTimer(timeBetweenRequests)
          buffer = 0
        }
        await mainProfileSheet.create({
          name: user.name.full_name,
          age_range: user.metadata ? user.metadata.age : 'Not completed',
          gender: user.gender,
          language: user.language,
          location: user.location.name || 'Unavailable without Facebook Login',
          source_type: user.metadata ? user.metadata.source_type : 'Not completed',
          source_name: user.metadata ? user.metadata.source_name : 'Not completed',
          motivation: user.metadata ? user.metadata.motivation_to_learn_english : 'Not completed',
          interests: user.metadata ? user.metadata.biggest_interests_personal : 'Not completed',
          status: user.subscription.status,
          nps: user.metadata ? user.metadata.rating_value : 'Not completed',
          date_message_us: user.subscription_date,
          tutor_requested: user.tutor_request ? 'Yes' : 'No',
        })

        await detailedProfileSheet.create({
          name: user.name.full_name,
          first_name: user.name.first_name,
          last_name: user.name.last_name,
          picture: user.picture,
          age_range: user.metadata ? user.metadata.age : 'Not completed',
          gender: user.gender,
          language: user.language,
          location: user.location.name || 'Unavailable without Facebook Login',
          accent: user.content ? user.content.plan.accent : 'Not completed',
          level: user.content ? user.content.plan.level : 'Not completed',
          source_type: user.metadata ? user.metadata.source_type : 'Not completed',
          source_name: user.metadata ? user.metadata.source_name : 'Not completed',
          motivation: user.metadata ? user.metadata.motivation_to_learn_english : 'Not completed',
          interests: user.metadata ? user.metadata.biggest_interests_personal : 'Not completed',
          date_message_us: user.subscription_date,
          time_message_us: user.subscription_date,
          birthday: 'Unavailable without Facebook Login',
          profile_link: 'Unavailable without Facebook Login',
          email: 'Unavailable without Facebook Login',
          status: user.subscription.status,
          nps: user.metadata ? user.metadata.rating_value : 'Not completed',
          tutor_requested: user.tutor_request ? 'Yes' : 'No',
        })
        buffer++
        successfullySaved++
      }
      console.info('Profiles successfully downloaded to GoogleSheets :: [%s]', successfullySaved)

    } catch (error) {
      console.error('An error occurred while saving USERS data on GoogleSheets CRM [Profile]')
      console.info('Profiles successfully downloaded to GoogleSheets before the error :: [%s]', successfullySaved)
      if (error) {
        console.error('Reason [%s]', error.message)
      } else {
        console.error('Reason [%s]', error)
      }
    }
  }

    /**
     * ========================================================
     * surveyUpdate
     * Description: drop and update survey sheet on CRM
     * ========================================================
     */
  async surveyUpdate () {
    let successfullySaved = 0
    try {
            // -- Retrieve Sheets
      const surveySheet = new googlesheet('survey')

            // -- Delete from profile
      await surveySheet.delete()

            // -- Retrieve data
      const usersCursor = userCollection.find()
      let user
      let surveyCursor
      let surveyWrapper = {}
      let survey

      // -- Prepare schema
      /**
       * ====================================================
       * Survey
       *
       * - user_name
       * - user_picture
       * - importance
       * - problem
       * - help
       * - most_important1
       * - currently_using
       * - likes_dislikes
       * - most_important2
       * - friend_idea
       * - correction_idea
       * - join_community
       * ====================================================
       */

      let buffer = 0

      while ((user = await usersCursor.next())) {

        surveyWrapper = {}
        survey = null
        surveyCursor = null

        if (buffer === bufferSize) {
          await messageTimer(timeBetweenRequests)
          buffer = 0
        }
        surveyCursor = analyticsCollection.aggregate([
          {
            $match: {
              user_id: user._id,
              type: 'survey',
            },
          },
          {
            $sort: { createdAt: 1 },
          },
        ])

        if (!surveyCursor) { continue }

        while ((survey = await surveyCursor.next())) {
          surveyWrapper[survey.key] = survey.value
        }

        if (!surveyWrapper) { continue }
        if (Object.keys(surveyWrapper).length === 0) { continue }

        await surveySheet.create({
          user_name: user.name.full_name,
          user_picture: user.picture,
          importance: surveyWrapper.importance || surveyWrapper.surveyQuestion1 || 'Not provided yet',
          problem: surveyWrapper.problem || surveyWrapper.surveyQuestion2 || 'Not provided yet',
          help: surveyWrapper.help || surveyWrapper.surveyQuestion3 || 'Not provided yet',
          most_important1: surveyWrapper.most_important1 || surveyWrapper.surveyQuestion4 || 'Not provided yet',
          currently_using: surveyWrapper.currently_using || surveyWrapper.surveyQuestion5 || 'Not provided yet',
          likes_dislikes: surveyWrapper.likes_dislikes || surveyWrapper.surveyQuestion6 || 'Not provided yet',
          most_important2: surveyWrapper.most_important2 || surveyWrapper.surveyQuestion7 || 'Not provided yet',
          friend_idea: surveyWrapper.friend_idea || surveyWrapper.surveyQuestion8 || 'Not provided yet',
          correction_idea: surveyWrapper.correction_idea || surveyWrapper.surveyQuestion9 || 'Not provided yet',
          join_community: surveyWrapper.join_community || surveyWrapper.surveyQuestion10 || 'Not provided yet',
        })
        buffer++
        successfullySaved++
      }
      console.info('Number of surveys successfully downloaded to GoogleSheets :: [%s]', successfullySaved)

    } catch (error) {
      console.error('An error occurred while saving SURVEY data on GoogleSheets CRM [Profile]')
      console.info('Number of surveys successfully downloaded to GoogleSheets before the error :: [%s]', successfullySaved)
      if (error) {
        console.error('Reason [%s]', error.message)
      } else {
        console.error('Reason [%s]', error)
      }
    }
  }

    /**
     * ============================================================
     * tutorRequestUpdate
     * Description: Drop and update tutor request sheet on crm
     * ============================================================
     */
  async tutorRequestUpdate () {
    let successfullySaved = 0
    try {
      // -- Update google sheets
      const tutorRequestsSheet = new googlesheet('tutor-requests')

      // -- Delete from profile
      await tutorRequestsSheet.delete()

            // -- Retrieve data
      const tutorRequestsCursor = tutorRequestCollection.aggregate([
        {
          $lookup: {
            from: 'user',
            localField: 'user_id',
            foreignField: 'senderId',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
      ])
      let tutorRequest = await tutorRequestsCursor.next()

      if (!tutorRequest) {
        throw new Error({ message: 'No tutor requests to store found' })
      }

      let buffer = 0
      do {
        if (buffer === bufferSize) {
          await messageTimer(timeBetweenRequests)
          buffer = 0
        }
        await tutorRequestsSheet.create({
          user_name: tutorRequest.user.name.full_name,
          user_picture: tutorRequest.user.picture,
          current_country: tutorRequest.current_country,
          user_accent: tutorRequest.user.content.plan.accent,
          user_level: tutorRequest.user.content.plan.level,
          self_description: tutorRequest.self_description,
          interests: tutorRequest.interests,
          time_of_day_for_calls: tutorRequest.time_of_day_for_calls.map(value => maps.TimeOfDay[value])[0],
          time_of_day_for_calls2: tutorRequest.time_of_day_for_calls.map(value => maps.TimeOfDay[value])[1] || 'Not provided',
          time_of_week_for_calls: maps.TimeOfWeek[tutorRequest.time_of_week_for_calls],
          internet_speed_description: maps.InternetSpeedDescription[tutorRequest.internet_speed_description] || 'Data unavailable for old users',
          request_date: tutorRequest.date,
          other_information: tutorRequest.other_information || 'Data unavailable for old users',
        })
        buffer++
        successfullySaved++
        tutorRequest = await tutorRequestsCursor.next()
      } while (tutorRequest)
      console.info('Number of tutor requests successfully downloaded to GoogleSheets :: [%s]', successfullySaved)

    } catch (error) {
      console.info('Number of tutor requests successfully downloaded to GoogleSheets before the error :: [%s]', successfullySaved)
      if (error.message) {
        console.error('Events during tutor saving: [%s]', error.message)
      } else {
        console.error('Events during tutor saving: [%s]', error)
      }
    }
  }
}

module.exports = new CRM()
