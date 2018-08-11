const axios = require('axios')

class RooWebhook {

  static async postCall (data) {
    try {
      return (await axios.request({
        url: 'webhook',
        method: 'post',
        baseURL: process.env.ROO_BASE_URL,
        data,
      })).data
    } catch (reason) {
      console.log('An error occurred :: ', reason)
      throw new Error(reason)
    }
  }
    /**
     * Events calling
     * @return {void}
     */
    static async paymentSubscriptionFinished (conversationId, plan, status) {
      try {
        await RooWebhook.postCall({
          event: 'paymentSubscriptionFinished',
          payload: {
            conversationId,
            plan,
            status,
          },
        })
      } catch (reason) {
        console.log('RooWebhook (paymentSubscriptionFinished) event calling error ', reason)
      }
    }

}

module.exports = RooWebhook
