/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const { setTimeout } = require('timers');
const axios = require('axios');

/**
 * Collections
 */
const userCollection = mongoose.connection.collection('user');

/**
 * messageTimer
 * @param {Integer} ms => milliseconds to wait
 */
const messageTimer = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * typingDots
 * @param {String} senderId => User Sender ID information
 * @param {Enum} state => Turn on / Turn off the typing dots
 */
const typingDots = async (senderId, state = 0) => {
  let typingState = 'typing_off';
  switch (state) {
    case 0:
      typingState = 'typing_off';
      break;
    case 1:
      typingState = 'typing_on';
      break;
    default:
      console.error('User sent an invalid state to typing dots and that\'s the reason it is blowing up.');
  }

  try {
    return (await axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: `${process.env.FB_BASE_URL}/v2.6/me/messages?access_token=${process.env.FB_ACCESS_TOKEN}`,
      method: 'post',
      data: `{"recipient":{"id":"${senderId}"}, "sender_action":"${typingState}"}`,
    })).data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) { console.error('Typing dots could not be sent properly', error.response.data.error.message); } else { console.error('Typing dots could not be sent properly'); }
  }
};

class basicSender {
  constructor(senderId) {
    this.senderId = senderId;
  }

  async sendMessages(msgs, index = 0) {
    try {
      if (!Array.isArray(msgs)) {
        throw new Error(`WRONG PARAMETER IN basicSender, NOT AN ARRAY OF OBJECTS:\n${msgs}`);
      }
      if (msgs[index] && index < msgs.length) {
        const writing = msgs[index].type !== 'text' ? 1250 : Math.min(300 * msgs[index].content.length, 2500);

        await typingDots(this.senderId, 1)
          .catch(e => console.error('Error turning on typing dots at basicSender.management :: ', e));
        await messageTimer(writing);
        await typingDots(this.senderId, 0)
          .catch(e => console.error('Error turning off typing dots at basicSender.management :: ', e));

        // -- Bot is sending the message
        const self = this;
        if (msgs[index].type === 'audio') {
          // -- Get audio from brain
          try {
            const user = await userCollection.findOne({ senderId: this.senderId });
            const pronounceResponse = (await axios.request({
              headers: { 'Content-Type': 'application/json' },
              url: 'pronunciation',
              method: 'post',
              baseURL: process.env.PYBRAIN_BASE_URL,
              data: {
                text: msgs[index].content, senderId: this.senderId, gender: user.gender, accent: user.content.plan.accent,
              },
            })).data;

            if (!pronounceResponse) {
              throw new Error('[basicSender::sendMessages()] Error while generating the audio file');
            }
            if (!pronounceResponse.data || pronounceResponse.status !== 200) {
              console.log('Error details :: ', pronounceResponse);
              throw new Error('[basicSender::sendMessages()] Error while generating the audio file :: probably user does not exist');
            }

            // -- Send audios using facebook directly
            if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') { console.log('Sending using facebook'); }
            const preparedMessage = `{
            "messaging_type": "RESPONSE",
            "recipient":{ "id": "${this.senderId}" },
            "message":{ 
                "attachment":{ 
                  "type":"${msgs[index].type}",
                   "payload": {
                   "url":"${pronounceResponse.data.fileUrl}",
                   "is_reusable":true
                  }
                }
            }
          }`;

            // --- FACEBOOK MESSAGES SENDER
            axios.request({
              headers: { 'Content-Type': 'application/json' },
              url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/messages?access_token=${process.env.FB_ACCESS_TOKEN}`,
              method: 'post',
              data: preparedMessage,
            }).then(async () => {
              await self.sendMessages(msgs, index + 1);
            });
          } catch (error) {
            console.error('(╯°□°）╯︵ ┻━┻ ERROR ::\n On basicSender-api.management at audio sending.\n', error.message || error);
            console.info('Skipping audio');
            await self.sendMessages(msgs, index + 1);
          }
        } else {
          // -- Send every other message using basicSender

          // -- DIRECT FACEBOOK TO SEND MESSAGES
          this.sendMessagesFacebook(msgs[index].type, msgs[index].content)
            .then(async () => {
              await self.sendMessages(msgs, index + 1);
            })
            .catch(async (error) => {
              console.error('basicSender Error :: ', error);
              await self.sendMessages(msgs, index + 1);
            });

          /* axios.request({
            url: `conversations/${this.conversationId}/messages`,
            method: 'post',
            baseURL: process.env.basicSender_BASE_URL,
            data: {
              messages: [msgs[index]],
            },
            headers: {
              Authorization: `Token ${process.env.basicSender_REQUEST_TOKEN}`,
            },
          })
          .then(async () => {
            await self.sendMessages(msgs, index + 1)
          })
          .catch(error => {
            console.error('Error at basicSender.AI request for message to be send to Facebook :: ')
            console.error('Details :: ', {
              status: error.response.status,
              statusText: error.response.statusText,
              url: error.response.config.url,
              data: error.response.data
            })
          }) */
        }
      } else { return true; }
    } catch (reason) {
      console.error('Error in basicSender.sendMessages :: ', reason);
    }
  }

  static prepareContent(text = '', media = '', audio = '', listen = '') {
    // -- Prepare messages
    const msgs = [];
    if (text !== '' && text.replace(/ /g, '') !== '') {
      // -- If we have a text we can have the code [[]] specific for buttons (quickReplies)
      let quickReply;
      try {
        if ((/\[\[.*]]/i).test(text)) {
          quickReply = text;
        } else {
          quickReply = undefined;
        }
      } catch (error) {
        quickReply = undefined;
      }

      if (quickReply) {
        // -- Quick reply
        const buttonName = quickReply.split('[[')[1].split(']]')[0];
        let title = quickReply.split('[[')[0];
        const empty = /^\s*$/i;
        if (empty.test(title)) { title = '😁👇'; }
        msgs.push({
          type: 'quickReplies',
          content: {
            title,
            buttons: [
              { title: buttonName, value: 'on_demand_content_messages' },
            ],
          },
        });
      } else {
        // -- Normal basic text message
        msgs.push({
          type: 'text',
          content: text,
        });
      }
    }

    // -- Check related with media part of the message
    const mediaSplit = media.split('||').filter(url => url !== '' && url !== 'undefined' && url.replace(/ /g, '') !== '');

    if (mediaSplit.length === 1) {
      media = mediaSplit[0];
    } else if (mediaSplit.length === 0) {
      media = '';
    } else if (mediaSplit.length > 1) {
      // -- Carousel
      const content = [];

      for (const url of mediaSplit) {
        content.push({
          title: 'Today\'s featured image!',
          imageUrl: url,
        });
      }

      msgs.push({
        type: 'carousel',
        content,
      });
    }

    if (media.indexOf('youtube') !== -1 && media !== '') {
      // -- Video
      const videoId = media.split('?v=').pop();
      msgs.push({
        type: 'button',
        content: {
          title: 'Click below 👇 and let the action begin 🎬!',
          imageUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`,
          buttons: [
            {
              title: 'Watch now!',
              type: 'web_url',
              url: media,
            },
          ],
        },
      });
    } else if ((media.indexOf('.gif') !== -1) && media !== '') {
      // -- Gif
      msgs.push({
        type: 'picture',
        content: media,
      });
    } else if ((media.indexOf('.png') !== -1 || media.indexOf('.jpg') !== -1 || media.indexOf('.jpeg') !== -1 || media.indexOf('.tiff') !== -1 || media.indexOf('.bmp') !== -1) && media !== '') {
      // -- Image
      msgs.push({
        type: 'picture',
        content: media,
      });
    } else if (media !== '') {
      // -- Other type of file
      msgs.push({
        type: 'text',
        content: media,
      });
    }

    /**
     * Valid audio files
     */
    if (audio && audio !== '') {
      msgs.push({
        type: 'audio',
        content: audio,
      });
    }

    /**
     * Listen formatter
     */
    if (listen && listen !== '') {
      msgs.push({
        type: 'button',
        content:
        {
          title: 'Click below buddy 👇 #learnwithroo',
          buttons: [
            { title: 'View Now! 🔭', type: 'web_url', url: listen },
          ],
        },
      });
    }

    return msgs;
  }

  async sendMessagesFacebook(type, payload) {
    let preparedMessage;

    if (!payload) { return; }
    if (type === 'picture') { type = 'image'; }

    if (type === 'carousel') {
      const carousel = [];
      // NOTE: content_type supported by FB are text, location, phone number and email
      for (const cards of payload) {
        if (cards.buttons && cards.subtitle) {
          const buttonsOfCard = [];
          for (const buttonTemplate of cards.buttons) {
            if (buttonTemplate.type === 'postback') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                payload: buttonTemplate.value,
              });
            } else if (buttonTemplate.type === 'web_url') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                url: buttonTemplate.url,
              });
            } else if (buttonTemplate.type === 'element_share') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
              });
            }
          }
          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
            subtitle: cards.subtitle,
            buttons: buttonsOfCard,
          });
        } else if (cards.buttons) {
          const buttonsOfCard = [];
          for (const buttonTemplate of cards.buttons) {
            if (buttonTemplate.type === 'postback') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                payload: buttonTemplate.value,
              });
            } else if (buttonTemplate.type === 'web_url') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                url: buttonTemplate.url,
              });
            } else if (buttonTemplate.type === 'element_share') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
              });
            }
          }
          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
            buttons: buttonsOfCard,
          });
        } else if (cards.subtitle) {
          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
            subtitle: cards.subtitle,
          });
        } else {
          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
          });
        }
      }

      // Set the prepared message
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: carousel,
            },
          },
        },
      });
    }

    if (type === 'button') {
      const buttonsArray = [];
      // NOTE: content_type supported by FB are text, location, phone number and email
      for (const buttons of payload.buttons) {
        if (buttons.type === 'postback') {
          buttonsArray.push({
            type: buttons.type,
            title: buttons.title,
            payload: buttons.value,
          });
        } else if (buttons.type === 'web_url') {
          buttonsArray.push({
            type: buttons.type,
            title: buttons.title,
            url: buttons.url,
          });
        } else if (buttons.type === 'element_share') {
          buttonsArray.push({
            type: buttons.type,
          });
        }
      }

      // Set the prepared message
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: type,
              text: payload.title,
              buttons: buttonsArray,
            },
          },
        },
      });
    } else if (type === 'quickReplies') {
      const quickRepliesArray = [];
      // NOTE: content_type supported by FB are text, location, phone number and email
      for (const buttons of payload.buttons) {
        if (buttons.image_url) {
          quickRepliesArray.push({
            content_type: 'text',
            title: buttons.title,
            payload: buttons.value,
            image_url: buttons.image_url,
          });
        } else {
          quickRepliesArray.push({
            content_type: 'text',
            title: buttons.title,
            payload: buttons.value,
          });
        }
      }

      // Set the prepared Message
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          text: payload.title,
          quick_replies: quickRepliesArray,
        },
      });
    } else if (type === 'text') {
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: { id: this.senderId },
        message: { text: payload },
      });
    } else if (type === 'audio') {
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        },
      });
    } else if (type === 'video') {
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        },
      });
    } else if (type === 'image') {
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        },
      });
    } else if (type === 'file') {
      preparedMessage = JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: this.senderId,
        },
        message: {
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        },
      });
    }

    if (!preparedMessage) {
      return;
    }
    return await axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: `${process.env.FB_BASE_URL}/${process.env.FB_VERSION}/me/messages?access_token=${process.env.FB_ACCESS_TOKEN}`,
      method: 'post',
      data: preparedMessage,
    })
      .catch(theError => console.error('Error Sending message to Facebook :: \n ', theError.response.data));
  }
}

module.exports = basicSender;
