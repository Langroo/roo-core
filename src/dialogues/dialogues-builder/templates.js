class templates {
  static format (genericMessage) {

    let type = genericMessage.type
    const payload = genericMessage.content
    let fallback_text = ''

    const isPersonalized = /{{first_name}}/i

    if (isPersonalized.test(JSON.stringify(payload))) {
      type = 'dynamic_text'
      fallback_text = payload.replace(isPersonalized, 'buddy')
    }
    let preparedMessage

    if (type === 'carousel') {

      const carousel = []
      // NOTE: content_type supported by FB are text, location, phone number and email
      for (const cards of payload) {
        if (cards.buttons && cards.subtitle) {

          const buttonsOfCard = []
          for (const buttonTemplate of cards.buttons) {

            if (buttonTemplate.type === 'postback') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                payload: buttonTemplate.value,
              })
            } else if (buttonTemplate.type === 'web_url') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                url: buttonTemplate.url,
              })
            } else if (buttonTemplate.type === 'element_share') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
              })
            }

          }
          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
            subtitle: cards.subtitle,
            buttons: buttonsOfCard,
          })

        } else if (cards.buttons) {

          const buttonsOfCard = []
          for (const buttonTemplate of cards.buttons) {

            if (buttonTemplate.type === 'postback') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                payload: buttonTemplate.value,
              })

            } else if (buttonTemplate.type === 'web_url') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
                title: buttonTemplate.title,
                url: buttonTemplate.url,
              })

            } else if (buttonTemplate.type === 'element_share') {
              buttonsOfCard.push({
                type: buttonTemplate.type,
              })
            }

          }
          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
            buttons: buttonsOfCard,
          })

        } else if (cards.subtitle) {

          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
            subtitle: cards.subtitle,
          })

        } else {

          carousel.push({
            title: cards.title,
            image_url: cards.imageUrl,
          })

        }
      }

      // Set the prepared message
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: carousel,
            },
          },
        }],
      })

    }

    if (type === 'card') {
      const elements = payload[0]
      if (elements.buttons && elements.subtitle) {

        const buttonsOfCard = []
        for (const buttonTemplate of elements.buttons) {

          if (buttonTemplate.type === 'postback') {
            buttonsOfCard.push({
              type: buttonTemplate.type,
              title: buttonTemplate.title,
              payload: buttonTemplate.value,
            })
          } else if (buttonTemplate.type === 'web_url') {
            buttonsOfCard.push({
              type: buttonTemplate.type,
              title: buttonTemplate.title,
              url: buttonTemplate.url,
            })
          } else if (buttonTemplate.type === 'element_share') {
            buttonsOfCard.push({
              type: buttonTemplate.type,
            })
          }

        }
        payload[0] = ({
          title: elements.title,
          image_url: elements.imageUrl,
          subtitle: elements.subtitle,
          buttons: buttonsOfCard,
        })

      } else if (elements.buttons) {

        const buttonsOfCard = []
        for (const buttonTemplate of elements.buttons) {

          if (buttonTemplate.type === 'postback') {
            buttonsOfCard.push({
              type: buttonTemplate.type,
              title: buttonTemplate.title,
              payload: buttonTemplate.value,
            })

          } else if (buttonTemplate.type === 'web_url') {
            buttonsOfCard.push({
              type: buttonTemplate.type,
              title: buttonTemplate.title,
              url: buttonTemplate.url,
            })

          } else if (buttonTemplate.type === 'element_share') {
            buttonsOfCard.push({
              type: buttonTemplate.type,
            })
          }

        }
        payload[0] = ({
          title: elements.title,
          image_url: elements.imageUrl,
          buttons: buttonsOfCard,
        })

      } else if (elements.subtitle) {

        payload[0] = ({
          title: elements.title,
          image_url: elements.imageUrl,
          subtitle: elements.subtitle,
        })

      } else {

        payload[0] = ({
          title: elements.title,
          image_url: elements.imageUrl,
        })

      }

      // Set the prepared message
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: payload,
            },
          },
        }],
      })
    }

    if (type === 'button') {

      const buttonsArray = []
      // NOTE: content_type supported by FB are text, location, phone number and email
      for (const buttons of payload.buttons) {

        if (buttons.type === 'postback') {
          buttonsArray.push({
            type: buttons.type,
            title: buttons.title,
            payload: buttons.value,
          })
        } else if (buttons.type === 'web_url') {
          buttonsArray.push({
            type: buttons.type,
            title: buttons.title,
            url: buttons.url,
          })
        } else if (buttons.type === 'element_share') {
          buttonsArray.push({
            type: buttons.type,
          })
        }

      }

      // Set the prepared message
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type: 'template',
            payload: {
              template_type: type,
              text: payload.title,
              buttons: buttonsArray,
            },
          },
        }],
      })

    } else if (type === 'quickReplies') {
      const quickRepliesArray = []
      // NOTE: content_type supported by FB are text, location, phone number and email
      for (const buttons of payload.buttons) {
        if (buttons.image_url) {
          quickRepliesArray.push({
            content_type: 'text',
            title: buttons.title,
            payload: buttons.value,
            image_url: buttons.image_url,
          })
        } else {
          quickRepliesArray.push({
            content_type: 'text',
            title: buttons.title,
            payload: buttons.value,
          })
        }
      }

      // Set the prepared Message
      preparedMessage = Object.assign({}, {
        messages: [{
          text: payload.title,
          quick_replies: quickRepliesArray,
        }],
      })
    } else if (type === 'text') {
      preparedMessage = Object.assign({}, {
        messages: [{ text: payload }],
      })
    } else if (type === 'dynamic_text') {
      preparedMessage = Object.assign({}, {
        messages: [{
          dynamic_text: {
            text: payload,
            fallback_text,
          },
        }],
      })
    } else if (type === 'audio') {
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        }],
      })
    } else if (type === 'video') {
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        }],
      })
    } else if (type === 'image') {
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        }],
      })
    } else if (type === 'file') {
      preparedMessage = Object.assign({}, {
        messages: [{
          attachment: {
            type,
            payload: {
              url: payload,
              is_reusable: true,
            },
          },
        }],
      })
    }
    return preparedMessage
  }

}

module.exports = templates
