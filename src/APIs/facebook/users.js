/**
 * Global dependencies
 */
const axios = require('axios')
const crypto = require('crypto')
const Raven = require('raven')
Raven.config('https://96d6795013a54f8f852719919378cc59@sentry.io/304046').install()
require('dotenv').config()

// -- General functions
Array.prototype.last = function () { return this[this.length - 1] }
Array.prototype.first = function () { return this[0] }
const getImageID = (url) => url.split('/').last().split('?').first()
const generateHash = (str) => crypto.createHash('md5').update(str).digest('hex')
const generateProof = (value, key) => crypto.createHmac('sha256', key).update(value).digest('hex')

const endpoints = {
  generalData: '',    // -- User general data
  games: 'games',     // -- User games used
  likes: 'likes',     // -- User general likes
  music: 'music',     // -- User music preference
  movies: 'movies',    // -- User movies preference
  ids: 'ids_for_apps', // -- Retrieve the id's for pages (apps)
}

const baseURL = `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/`

class Users {
  constructor (user_id, user_token, page_token) {
    if (!user_id) { throw new Error('User id is not set, you are not able to use this object.') }
    if (!user_token) { throw new Error('User token is not set, you are not able to use this object.') }
    if (!page_token) { throw new Error('Page token is not set, you are not able to use this object.') }
    this.user_id = user_id
    this.user_token = user_token
    this.page_token = page_token
    this.app_secret = process.env.FB_APP_SECRET
    this.app_id = process.env.FB_APP_ID
  }

  async retrieve () {
    return new Promise((resolve, reject) => {
            // -- Make the request
      const self = this
      axios.request({
        url: `${this.user_id}/${endpoints.generalData}?fields=id,name,link,picture,age_range,birthday,email,education.limit(10),gender,timezone,devices.limit(10),first_name,last_name,short_name,locale,location,games.limit(10),music.limit(10)&limit=10&access_token=${this.user_token}`,
        method: 'get',
        baseURL,
      })
            .then((response) => {
              self.general = response
              resolve(response.data)
            })
            .catch((error) => {
              reject(error.data)
            })
    })
  }

  async getProfileImage () {
    try {
      return getImageID((await axios.request({
        url: `${this.user_id}/picture?redirect=0&width=9999&access_token=${this.user_token}`,
        method: 'get',
        baseURL,
      })).data.data.url)
    } catch (reason) {
      if (typeof reason === typeof 'string') { console.log('An error occurred :: ', reason) } else { console.log('An error ocurred :: ', reason.response.data) }
    }
  }

  async getSenderId () {
    try {
      return (await axios.request({
        url: `${this.user_id}?fields=name,is_payment_enabled,ids_for_apps,ids_for_pages&access_token=${this.page_token}&appsecret_proof=${generateProof(this.page_token, this.app_secret)}`,
        method: 'get',
        baseURL,
      })).data
    } catch (reason) {
      console.log('An error occurred retrieving the senderId')
      console.log('Details :: ', reason.message)
    }
  }

  /**
   *
   * @param {String} url
   * @param {StringArray} params
   */
  static async commonRequest (url, params = null) {
    try {
      if (url === null || url === undefined) { throw new Error('URL is not defined, HTTP request cannot be done.') }

      const request_params = { access_token: process.env.FB_ACCESS_TOKEN }
      if (params === null) { console.log('Params are null') } else if (params === undefined) { console.log('Params are undefined') } else if (params instanceof Array && params.length === 0) { console.log('Params are not set') } else if (params instanceof Array && params.length > 0) { request_params.fields = params.join() } else { throw new Error('Params must be an array') }

      return (await axios.request({
        url,
        method: 'get',
        baseURL: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/`,
        params: request_params,
      })).data

    } catch (reason) {
      if (typeof reason === typeof 'string') { console.log('An error ocurred while sending request to API :: ', reason) } else {
        console.log('An error ocurred while sending request to API :: ', {
          status: reason.response.status,
          statusText: reason.response.statusText,
          data: reason.response.data,
        })
      }
    }
  }

  /**
   * To manage Facebook API interaction
   */

  // -- CREATE
  /**
   * @param {String} sender_id
   */
  static async getSenderInformation (sender_id, params = null) {
    return Users.commonRequest(sender_id, params)
  }

  static async getSenderPicture (sender_id) {
    return this.commonRequest(`${sender_id}/picture?type=square`)
  }

  static async getUserHash (senderId) {
    const facebookProfile = await this.getSenderInformation(senderId)
    return generateHash(getImageID(facebookProfile.profile_pic))
  }

  static async getUserPublicInformation (senderId) {
    try {

      return (await axios.request({
        url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/${senderId}`,
        method: 'get',
        params: {
          fields: [
            'first_name',
            'last_name',
            'profile_pic',
            'locale',
            'timezone',
            'gender',
          ].join(),
          access_token: process.env.FB_ACCESS_TOKEN,
        },
      })).data

    } catch (reason) {
      console.error('(╯°□°）╯ ERROR retrieving FB User Public Data')
      if (reason.response) {
        console.error('This Shit happened :: ', reason.response.data); throw new Error(reason.response.data)
      } else { console.error('This Shit happened :: ', reason); throw new Error(reason) }

    }
  }
}

module.exports = Users

