/**
 * Global dependencies
 */
const axios = require('axios');
require('dotenv').config();

const endpoints = {
  generalData: '', // -- User general data
  games: 'games', // -- User games used
  likes: 'likes', // -- User general likes
  music: 'music', // -- User music preference
  movies: 'movies', // -- User movies preference
};

const baseURL = `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/`;

class Pages {
  constructor(page_id, user_token, page_token) {
    if (!page_id) {
      throw new Error('User id is not set, you are not able to use this object.');
    }
    if (!user_token) {
      throw new Error('User token is not set, you are not able to use this object.');
    }
    if (!page_token) {
      throw new Error('Page token is not set, you are not able to use this object.');
    }
    this.page_id = page_id;
    this.user_token = user_token;
    this.page_token = page_token;
  }

  retrieve() {
    return new Promise((resolve, reject) => {
      const self = this;
      axios.request({
        url: `${this.page_id}/${endpoints.generalData}?fields=link,picture,name&limit=10&access_token=${this.user_token}`,
        method: 'get',
        baseURL,
      })
        .then((response) => {
          self.general = response;
          resolve(response.data);
        })
        .catch((error) => {
          reject(error.data);
        });
    });
  }
}

module.exports = Pages;
