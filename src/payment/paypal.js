const paypal = require('paypal-rest-sdk');

/*
paypal.configure({
  mode: process.env.PAYPAL_MODE, // sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID, // please provide your client id here
  client_secret: process.env.PAYPAL_CLIENT_SECRET, // provide your client secret here
});
*/

// -- Inner functions
const createPay = payment => new Promise((resolve, reject) => {
  paypal.payment.create(payment, (err, payment) => {
    if (err) {
      reject(err);
    } else {
      resolve(payment);
    }
  });
});

const executePay = (paymentId, payment) => new Promise((resolve, reject) => {
  paypal.payment.execute(paymentId, payment, (error, response) => {
    if (error) {
      reject(error);
    } else {
      resolve(response);
    }
  });
});

// -- Exported functions
const getPaymentInfo = paymentId => new Promise((resolve, reject) => {
  paypal.payment.get(paymentId, (error, response) => {
    if (error) {
      reject(error);
    } else {
      resolve(response);
    }
  });
});

const createPayment = (amount, description, conversationId, currency) => new Promise((resolve, reject) => {
  const payment = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: `${process.env.HOST}/payments/paypal/success`,
      cancel_url: `${process.env.HOST}/payments/paypal/error`,
    },
    transactions: [{
      amount: {
        total: Math.ceil(amount),
        currency,
      },
      description,
      custom: conversationId,
    }],
  };

  createPay(payment)
    .then((transaction) => {
      const { id } = transaction;
      const { links } = transaction;
      let counter = links.length;
      while (counter--) {
        if (links[counter].method == 'REDIRECT') {
          resolve(links[counter].href);
        }
      }
    })
    .catch((err) => {
      console.log(err);
      resolve(`${process.env.HOST}/payments/paypal/error`);
    });
});

const executePayment = (paymentParams, transaction) => new Promise((resolve, reject) => {
  const data = {
    payer_id: paymentParams.PayerID,
    transactions: [transaction],
  };

  executePay(paymentParams.paymentId, data)
    .then((response) => {
      resolve(response);
    })
    .catch((error) => {
      console.log('An error ocurred :: ', error);
      reject(error);
    });
});

module.exports = {
  createPayment,
  executePayment,
  getPaymentInfo,
};
