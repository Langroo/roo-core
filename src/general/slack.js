/** *
 * This file contains the functions to send messages to Slack
 * Its purpose is to send notifications according to specific actions of the users
 * The current notifications to send are:
 * Payment Completion
 * Function execution failures
 * Errors in core functionalities: on-demand content, profile creation, payment reception
 */

const axios = require('axios');

const notifyError = (message, culprit) => {
  const url = process.env.DEPLOYMENT_INFO_SLACK_URL;
  const data = {
    icon_emoji: ':x:',
    username: 'ROO API',
    attachments: [
      {
        fallback: `Error :: ${message}`,
        color: '#c50000',
        pretext: 'Roo API Reporting System',
        author_icon: 'http://flickr.com/icons/bobby.jpg',
        title: `Error At ${process.env.NODE_ENV.toUpperCase()} Environment `,
        text: 'An error occurred during the execution of a function.',
        fields: [
          {
            title: 'Module',
            value: culprit,
            short: false,
          },
          {
            title: 'Priority',
            value: 'High',
            short: false,
          },
          {
            title: 'Details',
            value: `${message}`,
            short: false,
          },
        ],
        image_url: 'http://my-website.com/path/to/image.jpg',
        thumb_url: 'https://apidb.langroo.com/',
        footer: 'Langroo API',
        footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
        ts: 123456789,
      },
    ],
  };
  axios(
    {
      url,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    },
  )
    .then(() => {
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.info('\nReport sent successfully to Slack\n');
      }
    })
    .catch(err => console.log('(╯°□°）╯︵ ┻━┻ ERROR SENDING MESSAGE TO SLACK X_X :: ', err));
};

const notifyPayment = (message, userName, amount, currency) => {
  const url = process.env.PAYMENT_NOTIFICATIONS_SLACK_URL;
  const data = {
    icon_emoji: ':x:',
    username: 'ROO API',
    attachments: [
      {
        fallback: `Payment Received :: ${message}`,
        color: '#00a10a',
        pretext: 'Roo API Reporting System',
        author_icon: 'http://flickr.com/icons/bobby.jpg',
        title: `We have received a payment from ${userName} of ${amount}${currency}!`,
        text: 'A user has payed for a tutor successfully',
        fields: [
          {
            title: 'Details',
            value: `${message}`,
            short: false,
          },
        ],
        image_url: 'http://my-website.com/path/to/image.jpg',
        thumb_url: 'https://apidb.langroo.com/',
        footer: 'Langroo API',
        footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
        ts: 123456789,
      },
    ],
  };
  axios(
    {
      url,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    },
  )
    .then(() => {
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.info('\nReport sent successfully to Slack\n');
      }
    })
    .catch(err => console.log('(╯°□°）╯︵ ┻━┻ ERROR SENDING MESSAGE TO SLACK X_X :: ', err));
};

module.exports = {
  notifyError,
};
