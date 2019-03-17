const mongoose = require('mongoose');
const StripeAPI = require('./stripe');
const planCollection = mongoose.connection.collection('plan');
const { SubscriptionManagement } = require('../database/index');
const UserManagement = require('../database/index').UsersManagement;

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
};

function timer(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // -- Dummy function
      resolve();
    }, milliseconds);
  });
}

class PaymentController {
  static async createPlans() {
    try {
      // -- Drop Stripe Old Plans
      const stripePlans = await StripeAPI.retrieveAllPlans();
      for (const plan of stripePlans.data) {
        console.log('Drop [- %s -] old plan from Stripe', plan.id);
        try {
          await StripeAPI.deletePlan(plan.id);
        } catch (error) {
          console.log('Skipping plan [- %s -]', plan.id);
        }
      }
      await timer(400);

      // -- Drop Stripe Old Products
      let stripeProducts = await StripeAPI.retrieveAllProducts(true);
      for (const product of stripeProducts.data) {
        console.log('Drop [- %s -] old product from Stripe', product.id);
        try {
          await StripeAPI.deleteProduct(product.id);
        } catch (error) {
          console.log('Skipping product [- %s -]', product.id);
        }
      }
      await timer(400);

      // -- Drop Stripe Old Products
      stripeProducts = await StripeAPI.retrieveAllProducts(false);
      for (const product of stripeProducts.data) {
        console.log('Drop [- %s -] old product from Stripe', product.id);
        try {
          await StripeAPI.deleteProduct(product.id);
        } catch (error) {
          console.log('Skipping product [- %s -]', product.id);
        }
      }
      await timer(400);

      const plansCursor = planCollection.find();
      let plan;
      while ((plan = await plansCursor.next()) != null) {
        // -- Plan does not exist, lets create it
        console.log('Creating [- %s -] plan on Stripe', plan._id);
        let stripePlan;
        try {
          stripePlan = await StripeAPI.createPlan(
            plan._id,
            Math.ceil(plan.price * plan.billing_frequency.period_quantity * 100),
            plan.currency.toLowerCase(),
            {
              value: plan.billing_frequency.period_type,
              count: plan.billing_frequency.period_quantity,
            },
            {
              name: plan.name,
            },
          );
        } catch (error) {
          console.log('Skip plan creation... Already exist');
        }
      }
    } catch (reason) {
      console.log('PaymentController (createPlans) error :: ', reason);
      throw new Error(reason);
    }
  }

  /**
     * Drop all our customers from stripe
     * For develop purposes
     * @return {void}
     */
  static async dropAllCustomers() {
    try {
      let customers;

      // -- Retrieve and delete
      customers = await StripeAPI.retrieveAllCustomers();
      for (const customer of customers.data) {
        console.log('Drop [- %s -] customer from Stripe', customer.id);
        await StripeAPI.deleteCustomer(customer.id);
      }
    } catch (reason) {
      console.log('PaymentController (dropAllCustomers) error :: ', reason);
      throw new Error(reason);
    }
  }

  /**
     * Drop all our subscriptions from stripe
     * For develop purposes
     * @return {void}
     */
  static async dropAllSubscriptions() {
    try {
      // -- Retrieve and delete
      const subscriptions = await StripeAPI.retrieveAllSubscriptions();
      for (const subscription of subscriptions.data) {
        console.log('Drop [- %s -] subscription from Stripe', subscription.id);
        await StripeAPI.deleteSubscription(subscription.id);
      }
    } catch (reason) {
      console.log('PaymentController (dropAllSubscriptions) error :: ', reason);
      throw new Error(reason);
    }
  }

  /**
     * Manage user retrievement and updating
     * @return {String} Subscription ID
     */
  static async createAndUpdateSubscription(
    data = {
      token: String,
      email: String,
      amount: Number,
      currency: String,
      description: String,
      conversationId: String,
      planId: String,
    },
  ) {
    try {
      // -- Check variables integrity
      if (!data) {
        throw new Error('{data} is not defined');
      }
      if (data.amount === null || data.amount === undefined || data.amount <= 0.0) {
        throw new Error('{data.amount} is not defined or it is not valid');
      }
      if (data.conversationId === null || data.conversationId === undefined || data.conversationId.length <= 0) {
        throw new Error('{data.conversationId} is not defined or it is not valid');
      }
      if (data.currency === null || data.currency === undefined || !['eur', 'usd'].includes(data.currency)) {
        throw new Error('{data.currency} is not defined or is nor properly set');
      }
      if (data.description === null || data.description === undefined || data.description.length <= 0) {
        throw new Error('{data.description} is not defined or is not properly set');
      }
      if (data.email === null || data.email === undefined || data.email.length <= 0) {
        throw new Error('{data.email} is not defined or is not valid');
      }
      if (data.planId === null || data.planId === undefined || data.planId.length <= 0) {
        throw new Error('{data.planId} is not defined or is not properly set');
      }
      if (data.token === null || data.token === undefined || data.token.length <= 0) {
        throw new Error('{data.token} is not defined or is not valid');
      }

      // -- Declare variables
      let subscription;
      let user;
      let customer;
      let trial_period_left = 0;

      // -- Check if there is a subscription related to the user
      subscription = await SubscriptionManagement.retrieve({
        query: { conversationId: data.conversationId },
        findOne: true,
      });
      if (!subscription) {
        // -- Get user and calculate free days left | Free days apply just for CONTENT_ONLY plans
        user = await UserManagement.retrieve({ query: { senderId: data.conversationId }, findOne: true });
        if (!user) {
          throw new Error('Error retrieving the user\'s data from the database');
        }

        // -- Create Customer if it not exist otherwise retrieve it
        if (!user.customerId) {
          customer = await StripeAPI.createCustomer(data.email, data.token);
        } else {
          customer = await StripeAPI.retrieveCustomer(user.customerId);
        }

        // -- Create new stripe subscription for the user
        subscription = await StripeAPI.createSubscription(customer.id, [data.planId], trial_period_left);

        // -- Create new local subscription
        subscription = await SubscriptionManagement.create({
          _id: subscription.id,
          customerId: customer.id,
          conversationId: data.conversationId,
          planId: data.planId,
          date: new Date(),
          currency: data.currency,
        });

        // -- Update user plan
        user = await UserManagement.findAndUpdate({ senderId: data.conversationId }, {
          'payment.status': 'paid_out',
          'subscription.product': PlanEnum[data.planId],
          'subscription.status': 'ACTIVE',
          customerId: customer.id,
        });

        // -- return data
        if (user !== null || user !== undefined) {
          return subscription._id;
        }
        throw new Error('Unexpected error occurred');
      } else {
        // -- Get user and calculate free days left | Free days apply just for CONTENT_ONLY plans
        user = await UserManagement.retrieve({ query: { senderId: data.conversationId }, findOne: true });
        if (user === null || user === undefined) {
          throw new Error('Unexpected error occurred');
        }
        if ((data.planId === 'basic-plan-usd' || data.planId === 'basic-plan-eur') && user.content.current.week <= 2) {
          trial_period_left = (user.content.current.week * 7) - (7 - user.content.current.day);
          trial_period_left = 14 - trial_period_left;
        }

        // -- Update user stripe subscription
        await StripeAPI.updateSubscription(subscription._id, [data.planId], trial_period_left);

        // -- Update local user subscription
        await SubscriptionManagement.update(subscription._id, {
          planId: data.planId,
          date: new Date(),
        });

        // -- Update user plan
        user = await UserManagement.findAndUpdate({ senderId: data.conversationId }, {
          'payment.status': 'paid_out',
          'subscription.product': PlanEnum[data.planId],
          'subscription.status': 'ACTIVE',
        });

        // -- return data
        if (user) {
          return subscription._id;
        }
        throw new Error('Unexpected error occurred');
      }
    } catch (reason) {
      console.log('PaymentController (createAndUpdateSubscription) error :: ', reason);
      throw new Error(reason);
    }
  }

  /**
     * Delete a user entire subscription
     * @return {void}
     */
  static async deleteSubscription(conversationId) {
    try {
      // -- Check parameters integrity
      if (conversationId === null || conversationId === undefined || conversationId.length <= 0) {
        throw new Error('{conversationId} is not defined');
      }

      // -- Declare variables
      let subscription;
      let user;

      // -- Find Subscription
      subscription = await SubscriptionManagement.retrieve({ query: { conversationId }, findOne: true });
      if (subscription === null || subscription === undefined || subscription === {}) {
        return;
      }

      // -- Delete stripe subscription
      await StripeAPI.deleteSubscription(subscription._id);

      // -- Delete local subscription
      await SubscriptionManagement.delete(subscription._id);

      // -- Update user plan
      user = await UserManagement.findAndUpdate({ senderId: conversationId }, {
        'payment.status': 'in_debt',
        'subscription.product': 'CONTENT_ONLY',
        'subscription.status': 'UNSUBSCRIBED',
      });

      // -- return data
      if (user) {
        return;
      }
      throw new Error('Unexpected error occurred');
    } catch (error) {
      console.log('PaymentController (deleteSubscription) error :: ', error);
    }
  }
}

module.exports = PaymentController;
