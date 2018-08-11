require('dotenv').config();

module.exports = {
  installed: {
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: `${process.env.HOST}/facebook/auth/callback`,
    quickCallbackURL: `${process.env.HOST}/facebook/quickAuth/callback`,
  },
};
