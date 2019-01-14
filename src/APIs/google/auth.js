/**
 * Global dependencies
 */
const fs = require('fs');
const readline = require('readline');
const googleAuth = require('google-auth-library');
require('dotenv').config();

// -- GOOGLE Credentials
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = `${__dirname}/credentials/`;
const TOKEN_PATH = `${TOKEN_DIR}sheets.token.json`;

class Auth {
  authenticate() {
    return new Promise((resolve, reject) => {
      const credentials = this.getClientSecret();
      const authorizePromise = this.authorize(credentials);
      authorizePromise.then(resolve, reject);
    });
  }

  getClientSecret() {
    return require('./credentials/token');
  }

  authorize(credentials) {
    return this.authorizeJWT(credentials);
  }

  authorizeJWT(credentials) {
    const auth = new googleAuth();

    return new Promise((resolve, reject) => {
      // Check if we have previously stored a token.
      const token = require('./credentials/jwt');

      const jwtClient = new auth.JWT(
        token.client_email,
        null,
        token.private_key,
        SCOPES,
      );

      jwtClient.authorize((error, credentials) => {
        if (error) {
          console.log('Authorize error...', error);
        } else {
          resolve(jwtClient);
        }
      });
    });
  }

  authorizeOAuth2(credentials) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = process.env.REDIRECT_URL === null || process.env.REDIRECT_URL === undefined ? credentials.installed.redirect_uris[0] : process.env.REDIRECT_URL;
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    return new Promise((resolve, reject) => {
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          this.getNewToken(oauth2Client).then((oauth2ClientNew) => {
            resolve(oauth2ClientNew);
          }, (err) => {
            reject(err);
          });
        } else {
          oauth2Client.credentials = JSON.parse(token);
          resolve(oauth2Client);
        }
      });
    });
  }

  getNewToken(oauth2Client, callback) {
    return new Promise((resolve, reject) => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') console.log('Authorize this app by visiting this url: \n ', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('\n\nEnter the code from that page here: ', (code) => {
        rl.close();
        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            reject();
          }
          oauth2Client.credentials = token;
          this.storeToken(token);
          resolve(oauth2Client);
        });
      });
    });
  }

  storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') console.log(`Token stored to ${TOKEN_PATH}`);
  }
}

module.exports = new Auth();
