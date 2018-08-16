/**
 * Global dependencies
 */
const express = require('express')
const axios = require('axios')
const router = express.Router()
require('dotenv').config()

/**
 * Local dependencies
 */
const paypal = require('../payment/index').PaypalAPI
const PlanManagement = require('../database/index').PlanManagement
const PaymentController = require('../payment/index').PaymentController
const RooWebhook = require('../webhooks/index').RooWebhook

/**
 * Auxiliar data structure
 */
const PlanEnum = {
  'basic-plan-usd': 'CONTENT_ONLY',
  'basic-plan-eur': 'CONTENT_ONLY',
  'casual-plan-usd': 'CASUAL_TUTOR',
  'casual-plan-eur': 'CASUAL_TUTOR',
  'standard-plan-usd': 'STANDARD_TUTOR',
  'standard-plan-eur': 'STANDARD_TUTOR',
  'elite-plan-usd': 'ELITE_TUTOR',
  'elite-plan-eur': 'ELITE_TUTOR',
}

/**
 * -------------------------------- Payment Subscription ---------------------------------
 */

/**
 * Create payment subscription
 * @return {Route}
 */
router.get('/:type/:conversationId/:currency', async (request, response, next) => {

  const type = request.params.type || ''
  const conversationId = request.params.conversationId || ''
  const currencyValue = request.params.currency.toLowerCase() || ''
  let currencySymbol = '$'

  try {
    if (!['basic', 'casual', 'standard', 'elite'].includes(type)) {
      throw new Error('Payment type is not correct')
    }
    if (!['usd', 'eur'].includes(currencyValue)) {
      throw new Error('Currency is not allowed')
    }
    if (conversationId === '') {
      throw new Error('Conversation ID is not set properly')
    }
    const planId = `${type}-plan-${currencyValue}`
    console.log('Stripe Payment initiated by user [- %s -]', conversationId)

    // -- Generating entire description
    let amount
    let description
    const key = process.env.STRIPE_PUBLIC_KEY
    let title
    let detail

    const plan = await PlanManagement.retrieve({ query: { _id: planId }, findOne: true })

    // -- The amount is billed every two weeks, so it gets multiplied by two
    amount = plan.price * 2
    description = plan.description
    title = plan.name
    detail = plan.detail

    if (currencyValue === 'usd') {
      currencySymbol = '$'
    } else if (currencyValue === 'eur') {
      currencySymbol = '€'
    }

    // -- Return main view
    return response.render('payment/request', {
      layout: false,
      amount,
      amountPerWeek: amount / 2,
      type,
      detail,
      amountBase100: Math.ceil(amount * 100),
      currency: {
        value: currencyValue,
        symbol: currencySymbol,
      },
      key,
      title,
      description,
      conversationId,
      planId,
    })
  } catch (error) {
    console.log('Payment type is not correct :: ', error)
    return response.redirect('/payment/error')
  }
})

/**
 * Cancel payment subscription
 * @return {Route}
 */
router.post('/cancel', async (request, response) => {
  // -- Prepare variables
  const conversationId = request.body.conversationId

  try {
    // -- Check variables integrity
    if (conversationId === null || conversationId === undefined || conversationId.length <= 0) {
      throw new Error('Conversation ID is not defined properly')
    }
    await PaymentController.deleteSubscription(conversationId)
    console.log('Stripe cancel subscription initiated by user [- %s -]', conversationId)

    // -- Return response
    response.status(200)
    response.statusMessage = 'subscription cancelled succesfully'
    return response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })

  } catch (error) {
    console.log('An error occurred :: ', error)

    // -- Return response
    response.status(500)
    response.statusMessage = error.toString()
    return response.json({
      statusMessage: response.statusMessage,
      statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * Success page
 * @return {Route}
 */
router.get('/success', async (request, response) => {
  // -- Prepare variables
  try {
    axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: process.env.PAYMENT_NOTIFICATIONS_SLACK_URL,
      method: 'post',
      data: '{"text":"A user payment has been registered successfully in Stripe."}',
    })
    console.log('User initiated payment dialogues')
  } catch (reason) {
    console.log('(╯°□°）╯︵ ┻━┻ ERROR sending the notification to SLACK :: ', reason)
  }
  return response.status(200).render('payment/success', { layout: false })
})

/**
 * Error page
 * @return {Route}
 */
router.get('/error', async (request, response) => {
  // -- Prepare variables
  return response.status(200).render('payment/error', { layout: false })
})

/**
 * ------------------------------- Stripe routes --------------------------------
 */
router.post('/charge', async (request, response) => {
  // -- Prepare data
  const data = {
    token: request.body.stripeToken,
    email: request.body.stripeEmail,
    amount: request.body.chargeAmount * 100,
    currency: request.body.currency,
    description: request.body.description,
    conversationId: request.body.conversationId,
    planId: request.body.planId,
  }

  console.log('Stripe charge upload started for user [- %s -]', data.conversationId)

  try {
    // -- Init subscription
    await PaymentController.createAndUpdateSubscription(data)

    // -- Call wekhook event
    await RooWebhook.paymentSubscriptionFinished(data.conversationId, PlanEnum[data.planId], 'success')

    // -- Return response
    return response.redirect('/payment/success')

  } catch (error) {
    console.log('There was a payment error :: ', error)

    // -- Call wekhook event
    await RooWebhook.paymentSubscriptionFinished(data.conversationId, PlanEnum[data.planId], 'error')

    // -- Return response
    return response.redirect('/payment/error')
  }
})

/**
 * Company Subscription
 */
router.post('/company-subscription', async (request, response) => {
  const body = request.body
  console.log('Body is :: ', body)

  try {
    // -- Return response
    response.status(200)
    response.statusMessage = 'subscription created succesfully'
    return response.json({
		    statusMessage: response.statusMessage,
		    statusCode: response.statusCode,
      data: null,
    })
  } catch (error) {
    console.log('[error] /payment/company-subscription :: ', error)
    // -- Return response
    response.status(500)
    response.statusMessage = error.toString()
    return response.json({
		    statusMessage: response.statusMessage,
		    statusCode: response.statusCode,
      data: null,
    })
  }
})

/**
 * -------------------------------------- Paypal payment ----------------------------------
 */
router.get('/paypal/:type/:conversationId/:currency', async (request, response, next) => {
  const type = request.params.type || ''
  const conversationId = request.params.conversationId || ''
  const currency = request.params.currency.toUpperCase() || ''

  try {
    if (!['basic', 'casual', 'standard', 'elite'].includes(type)) {
      throw new Error('Payment type is not correct')
    }
    if (!['USD', 'EUR'].includes(currency)) {
      throw new Error('Currency is not allowed')
    }
    if (conversationId === '') {
      throw new Error('Conversation ID is not set properly')
    }
    console.log('Paypal Payment initiated by user [- %s -]', conversationId)

    // -- Generating amount and description
    let amount = 0.0
    let description = ''
    if (type === 'basic') {
      amount = 1.0
      description = 'Payment test for basic with Paypal'
    } else if (type === 'casual') {
      amount = 16.99
      description = 'Payment test for casual with Paypal'
    } else if (type === 'standard') {
      amount = 30.99
      description = 'Payment test for standard with Paypal'
    } else if (type === 'elite') {
      amount = 49.99
      description = 'Payment test for elite with Paypal'
    }

    // -- Payment stuff
    const url = await paypal.createPayment(amount, description, conversationId, currency)
    return response.redirect(url)
  } catch (error) {
    return response.send(`Payment type is not correct :: ${error}`)
  }
})

router.get('/paypal/success', async (request, response, next) => {
  console.log('Paypal Payment success')
  const paymentDetails = await paypal.getPaymentInfo(request.query.paymentId)
  const transaction = paymentDetails.transactions[0]

  // -- User data
  const description = transaction.description
  const conversationId = transaction.custom
  const amount = transaction.amount

  // -- Execute payment
  try {
    const execute = await paypal.executePayment(request.query, transaction)
    console.log('User requesting assistance - Sending notification to SLACK')
    axios.request({
      headers: { 'Content-Type': 'application/json' },
      url: process.env.PAYMENT_NOTIFICATIONS_SLACK_URL,
      method: 'post',
      data: `{"text":"Facebook user ${execute.payer.payer_info.first_name} ${execute.payer.payer_info.last_name} has completed a payment successfully :) and now we have money!"}`,
    })
    return response.redirect('/payment/success')
  } catch (reason) {
    console.log('An error occurred while sending request to API:: ', reason)
    return response.redirect('/payment/error')
  }
})

module.exports = router
