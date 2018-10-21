class StripePayment {
  constructor () {
    this.stripeAPI = require('stripe')(process.env.STRIPE_SECRET_KEY)
  }

  // -- Related with customer
  async createCustomer (email, token) {
    return this.stripeAPI.customers.create({ email, source: token })
  }

  async retrieveCustomer (customerId) {
    if (!customerId) { throw new Error('Customer ID is not defined') }
    try {
      return await this.stripeAPI.customers.retrieve(customerId)
    } catch (reason) {
      if (reason.statusCode === 404) {
        // -- Resource not found
        return null
      }
      throw new Error(reason)
    }
  }

  async retrieveAllCustomers () {
    return this.stripeAPI.customers.list({ limit: 100 })
  }

  async deleteCustomer (customerId) {
    if (!customerId) {
      throw new Error('Customer ID is not defined')
    }
    try {
      return await this.stripeAPI.customers.del(customerId)
    } catch (reason) {
      throw new Error(reason)
    }
  }

  // -- Related with charges
  async createCharges (amount, currency, description, customer, metadata = {}) {
    return this.stripeAPI.charges.create({
      amount,
      description,
      currency,
      customer: customer.id,
      metadata,
    })
  }

  // -- Related with plans
  async createPlan (id, amount, currency, interval = { value: '', count: 0 }, product = { name: '', metadata: {} }) {
    if (id === null || id === undefined) {
      throw new Error('Plan ID is not defined')
    }
    if (product === undefined) {
      throw new Error('Product is not defined')
    }
    if (product.name === null || product.name === undefined) {
      throw new Error('Product Name is not defined')
    }
    if (interval === null || interval === undefined) {
      throw new Error('Interval is not defined')
    }
    if (interval.value === null
      || interval.value === undefined
      || !['day', 'week', 'month', 'year'].includes(interval.value)) {
      throw new Error('Interval is not defined correctly')
    }
    if (interval.count === null || interval.count === undefined || interval.count < 1) {
      throw new Error('Interval is not defined correctly')
    }

    return this.stripeAPI.plans.create({
      id,
      amount,
      currency,
      interval: interval.value,
      interval_count: interval.count,
      product,
    })
  }

  async retrievePlan (id) {
    if (id === null || id === undefined) {
      throw new Error('Plan ID is not defined')
    }
    try {
      return await this.stripeAPI.plans.retrieve(id)
    } catch (reason) {
      if (reason.statusCode === 404) {
        // -- Resource not found
        return null
      }
      throw new Error(reason)
    }
  }

  async deletePlan (id) {
    if (!id) {
      throw new Error('Plan ID is not defined')
    }
    try {
      return await this.stripeAPI.plans.del(id)
    } catch (reason) {
      throw new Error(reason)
    }
  }

  async retrieveAllPlans () {
    return this.stripeAPI.plans.list()
  }

  // -- Related with products
  async deleteProduct (id) {
    if (id === null || id === undefined) {
      throw new Error('Product ID is not defined')
    }
    try {
      return await this.stripeAPI.products.del(id)
    } catch (reason) {
      throw new Error(reason)
    }
  }

  async retrieveAllProducts (active = true) {
    return this.stripeAPI.products.list({ active, limit: 100 })
  }

  // -- Related with subscriptions
  async createSubscription (customerID, plans = [], trial_period_days = 14, billing = 'charge_automatically') {
    if (!customerID) {
      throw new Error('Customer ID is not defined')
    }
    if (plans.length === 0 || plans === null || plans === undefined) {
      throw new Error('Plans are not listed')
    }
    if (!trial_period_days) {
      throw new Error('Trial period days is not defined')
    }
    if (!billing) {
      billing = 'charge_automatically'
    }

    return this.stripeAPI.subscriptions.create({
      customer: customerID,
      items: plans.map(planID => {
        return {
          plan: planID,
        }
      }),
      trial_period_days,
      billing,
    })
  }

  async retrieveSubscription (suscriptionID) {
    if (suscriptionID === null || suscriptionID === undefined) {
      throw new Error('Subscription ID is not defined')
    }
    return this.stripeAPI.subscriptions.retrieve(suscriptionID)
  }

  async updateSubscription (suscriptionID, plans = [], trial_period_days = 14, billing = 'charge_automatically') {
    if (!suscriptionID) {
      throw new Error('Subscription ID is not defined')
    }
    if (plans.length === 0 || plans === null || plans === undefined) {
      throw new Error('Plans are not listed')
    }
    if (trial_period_days === null || trial_period_days === undefined) {
      throw new Error('Trial period days is not defined')
    }
    if (billing === null || billing === undefined) {
      billing = 'charge_automatically'
    }

    return this.stripeAPI.subscriptions.update(suscriptionID, {
      items: plans.map(planID => {
        return {
          plan: planID,
        }
      }),
      trial_end: 'now',
      billing,
    })
  }

  async deleteSubscription (suscriptionID) {
    if (suscriptionID === null || suscriptionID === undefined) {
      throw new Error('Subscription ID is not defined')
    }
    try {
      return await this.stripeAPI.subscriptions.del(suscriptionID)
    } catch (reason) {
      throw new Error(reason)
    }
  }

  async retrieveAllSubscriptions () {
    return this.stripeAPI.subscriptions.list({ limit: 100 })
  }
}

module.exports = new StripePayment()
