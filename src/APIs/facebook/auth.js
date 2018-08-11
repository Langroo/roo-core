/**
 * Dependencies
 */
const mongoose = require('mongoose')
const FacebookStrategy = require('passport-facebook').Strategy
const crypto = require('crypto')
const generateHash = (str) => crypto.createHash('md5').update(str).digest('hex')

/**
 * Local dependencies
 */
const facebookAuth = require('./credentials/token')
const flowCollection = mongoose.connection.collection('dialogs')
const LoginManagement = require('../../database/index').LoginManagement
const UsersManagement = require('../../database/index').UsersManagement
const FacebookUsers = require('./users')
const googlesheet = require('../google/index')
const redis = require('../../cache/index')
const Messages = require('../../dialogs/dialogs-content').dialogsContent
const basicSender = require('../../dialogs/dialogs-builder').basicSender
const maps = require('../../general/index').maps

module.exports = function (passport) {

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const serializedUser = await LoginManagement.retrieve({ id }, true)
      done(null, serializedUser)
    } catch (error) {
      console.log('Deserialize user error...', error)
      done(error)
    }
  })

  passport.use('facebook', new FacebookStrategy({
    display: 'popup',
    clientID: facebookAuth.installed.clientID,
    clientSecret: facebookAuth.installed.clientSecret,
    callbackURL: facebookAuth.installed.callbackURL,
    passReqToCallback: true,
  }, (request, accessToken, refreshToken, profile, done) => { // GLOBAL FUNCTION
    process.nextTick(async () => {

      // Variables
      let loginUser
      let user
      let facebookRequest
      let userCache
      let messageBuilder
      let fbUser
      let userData
      let loginObject

      try {
        // -- Check in DB if user already exist
        loginUser = await LoginManagement.retrieve({ _id: profile.id }, true)
        if (loginUser === null || loginUser === undefined) {
          throw new Error('User does not exist')
        }

        // -- User already exist
        try {
          // -- Sanity Check
          if (!request.senderId) {
            throw new Error('Sender ID must be defined')
          }

          // -- Get user information
          user = await UsersManagement.retrieve({
            query: { _id: generateHash(request.senderId) },
            findOne: true,
          })

          facebookRequest = new FacebookUsers(profile.id, accessToken, process.env.FB_ACCESS_TOKEN)
          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
            console.log('[facebook auth | User senderId (%s)]', request.senderId)
          }
          userCache = await redis.hashGetUser(generateHash(request.senderId))

          // -- Update Database (user goes to day one and week one)
          await UsersManagement.update(user._id, {
            'content.current.day': 1,
            'content.current.week': 1,
            'content.plan.language': 'english',
            'content.plan.accent': userCache.accent,
            'content.plan.level': userCache.level,
            FirstSubscriptionDate: new Date().toUserTimezone(user.location.timezone),
            'subscription.status': 'ACTIVE',
            'source.from':
              userCache.sourceFrom != undefined
              || userCache.sourceFrom != null
              || userCache.sourceFrom != '' ? userCache.sourceFrom : '',
            'source.value':
              userCache.sourceValue != undefined
              || userCache.sourceValue != null
              || userCache.sourceValue != '' ? userCache.sourceValue : '',
          })

          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
            console.log('User Re-SubscriptionDate :: [ %s ]', new Date().toUserTimezone(user.location.timezone).toString())
          }

          // -- Update user dialogs
          await flowCollection.findOneAndUpdate({ conversation_id: user.senderId }, { $set: { open_question: true } }, { new: true })

          // -- Send messages for final dialogs when user subscribes again to Langroo
          messageBuilder = new basicSender(user.senderId)
          await messageBuilder.sendMessages(Messages.firstSubscribeLangroo.map(message => {
            // -- Personalize alternative messages
            if (message.type === 'text') {
              message.content = message.content.replace(/{{name}}/g, user.name.short_name)
            }
            return message
          }))

          // -- User is logged in
          return done(null, user)
        } catch (error) {
          console.log('An error occurred on re-login ::\n', error.response.data)
        }

      } catch (error) {
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('New user, register creation initiated')
        }
        // console.log(request);
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Request body :: ', request.body)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Request params :: ', request.params)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Request query :: ', request.query)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Sender ID :: ', request.senderId)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Access token :: ', accessToken)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Refresh token :: ', refreshToken)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Profile :: ', profile)
        }
        if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
          console.log('Done :: ', done)
        }
        // -- User does not exist, let's create it

        try {
          facebookRequest = new FacebookUsers(profile.id, accessToken, process.env.FB_ACCESS_TOKEN)
          const senderIdResponse = await facebookRequest.getSenderId()
          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
            console.log('Sender ID response is :: ', senderIdResponse)
          }

          // -- Retrieve user data (profile, education, music and games)
          fbUser = await facebookRequest.retrieve()
          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
            console.log('[facebook auth | User senderId (%s)]', request.senderId)
          }
          userCache = await redis.hashGetUser(generateHash(request.senderId))

          // -- Sanity Check
          if (!request.senderId) {
            throw new Error('Sender ID must be defined')
          }

                    /* -- FACEBOOK PERMISSION NEEDED TO USE THIS PART --

                    let fbEducation = await Promise.all(fbUser["education"].map(education => {
                        return new FacebookPages(education["school"]["id"], accessToken, process.env.FB_ACCESS_TOKEN).retrieve();
                    }));
                    let fbGames = await Promise.all(fbUser["games"]["data"].map(game => {
                        return new FacebookPages(game["id"], accessToken, process.env.FB_ACCESS_TOKEN).retrieve();
                    }));
                    let fbMusic = await Promise.all(fbUser["music"]["data"].map(artist => {
                        return new FacebookPages(artist["id"], accessToken, process.env.FB_ACCESS_TOKEN).retrieve();
                    }));*/

          // -- Format user data structure
          userData = {
            _id: generateHash(request.query.senderId),
            conversationId: userCache.conversationId,
            senderId: userCache.senderId,
            name: {
              full_name: fbUser.name,
              first_name: fbUser.first_name,
              last_name: fbUser.last_name,
              short_name: fbUser.short_name,
            },
            picture: fbUser.picture.data.url,
            profile_link: fbUser.link,
            age: fbUser.age_range.max ? fbUser.age_range.max : fbUser.age_range.min,
            birthday: new Date(fbUser.birthday),
            email: fbUser.email,
            gender: fbUser.gender,
            language: fbUser.locale,
            location: {
              id: fbUser.location === undefined ? null : fbUser.location.id,
              name: fbUser.location === undefined ? null : fbUser.location.name,
              locale: fbUser.locale,
              timezone: fbUser.timezone,
            },
            devices: fbUser.devices,
            payment: {
              status: 'in_debt',
            },
            content: {
              current: {
                day: 1,
                week: 1,
                group: 1,
              },
              plan: {
                language: 'english',
                accent: userCache.accent,
                level: userCache.level,
              },
            },
            FirstSubscriptionDate: new Date().toUserTimezone(fbUser.timezone),
          }
          userData.age = ~~((Date.now() - (Number(userData.birthday))) / (31557600000))
          userData.source.from
            = userCache.sourceFrom != undefined
          || userCache.sourceFrom != null
          || userCache.sourceFrom != '' ? userCache.sourceFrom : ''
          userData.source.value
            = userCache.sourceValue != undefined
          || userCache.sourceValue != null
          || userCache.sourceValue != '' ? userCache.sourceValue : ''
          if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
            console.log('User FirstSubscriptionDate :: [ %s ]', userData.FirstSubscriptionDate.toString())
          }

          // -- Saving step
          // -- Save user in mongo db
          await UsersManagement.create(userData, { updateIfExist: true })
        } catch (err) {
          console.log('An error ocurred in passport login...', err)
          return done(err)
        }

        try {
          // -- Save login in mongo db
          loginObject = await LoginManagement.create({
            _id: profile.id,
            token: accessToken,
            name: profile.displayName,
          })
        } catch (err) {
          console.log('An error ocurred in login creation in MongoDb ::', err)
          return done(err)
        }

        try {
          // -- Google sheet
          const profileSheet = new googlesheet('profile')

          // -- Delete from profile
          await profileSheet.delete()

          // -- Save users profiles in googlesheets
          // -- REMEMBER TO REMOVE THIS LATER (TOO SLOW)
          const users = (await UsersManagement.retrieve()).map(user => {
            return {
              name: user.name.full_name,
              first_name: user.name.first_name,
              last_name: user.name.last_name,
              picture: user.picture,
              age: user.age,
              birthday: user.birthday,
              gender: user.gender,
              language: user.language,
              location: user.location.name,
              profile_link: user.profile_link,
              email: user.email,
              date_message_us: user.FirstSubscriptionDate,
              value: user.source.value,
              product: maps.ProductEnum[user.subscription.product],
              date_updated: new Date(),
            }
          })
          await profileSheet.create(users)

                  /* -- FACEBOOK PERMISSION NEEDED TO USE THIS PART --

                  await (new googlesheet("education")).create(
                      userData.education.map((education, index) => {
                          return {
                              user_name: userData.name,
                              user_picture: userData.picture,
                              education_type: education.etype,
                              school: education.school.name,
                              school_picture: education.school.picture,
                              page_link: education.school.link
                          };
                      })
                  );
                  await (new googlesheet("artists")).create(
                      userData.artists.map((artist, index) => {
                          return {
                              user_name: userData.name,
                              user_picture: userData.picture,
                              artist: artist.name,
                              artist_picture: artist.picture,
                              page_link: artist.link
                          };
                      })
                  );
                  await (new googlesheet("games")).create(
                      userData.games.map((game, index) => {
                          return {
                              user_name: userData.name,
                              user_picture: userData.picture,
                              game: game.name,
                              game_picture: game.picture,
                              page_link: game.link
                          };
                      })
                  );*/
        } catch (err) {
          console.log('An error occurred in user profile creation in Google Sheets ::', err)
          return done(err)
        }

        try {
          // -- Send user first subscribe to Langroo messages
          user = await UsersManagement.retrieve({
            query: { _id: loginObject._id },
            findOne: true,
          })

          // -- Update user dialogs
          await flowCollection.findOneAndUpdate({ conversation_id: user.senderId }, { $set: { open_question: true } }, { new: true })

          messageBuilder = new basicSender(user.senderId, user.conversationId)
          await messageBuilder.sendMessages(Messages.firstSubscribeLangroo.map(message => {
            // -- Personalize alternative messages
            if (message.type === 'text') {
              message.content = message.content.replace(/{{name}}/g, fbUser.first_name)
            }
            return message
          }))
        } catch (error) {
          console.log('An error ocurred sending messages after first registration ::', error)
          return done(error)
        }

        // -- Passport JS login
        return done(null, loginObject)
      }
    })
  }))
}
